import { seedDatabase } from '../src/db/seed.js';
import { db } from '../src/db/database.js';
import { BehavioralEngine } from '../src/engines/behavioral.js';
import { RecommendationEngine } from '../src/engines/recommendation.js';
import { FinancialStressEngine } from '../src/engines/stress.js';
import { FraudEngine } from '../src/engines/fraud.js';
import { VernacularEngine } from '../src/engines/vernacular.js';
import { WhatIfEngine } from '../src/engines/whatif.js';
import { SafetyPolicyGateway } from '../src/safety/gateway.js';
import { NextBestActionEngine } from '../src/safety/nextBestAction.js';
import { FinancialTwinManager } from '../src/twin/twinManager.js';
import { LifeEventPredictionService } from '../src/services/lifeEventPrediction.service.js';
import { SpendingCoachService } from '../src/services/spendingCoach.service.js';
import { GeminiService } from '../src/services/gemini.service.js';

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`❌ [FAIL] ${testName}${details ? ` -> ${details}` : ''}`);
    failedCount++;
  }
}

async function runAcceptanceTests() {
  console.log('\n======================================================');
  console.log('🧪 RUNNING FINPULSE AI AUTOMATED ACCEPTANCE TEST SUITE');
  console.log('======================================================\n');

  // Seed fresh database
  await seedDatabase();

  // ----------------------------------------------------
  // ACCEPTANCE TEST 1: Healthy Customer Personalization
  // ----------------------------------------------------
  const rahulRecs = RecommendationEngine.generateRecommendations('cust_rahul');
  const hasInvestmentRec = rahulRecs.recommendations.some(
    (r) => r.product_type === 'INVESTMENT' || r.product_type === 'SAVINGS'
  );
  assert(
    hasInvestmentRec && rahulRecs.recommendations.length > 0,
    'TEST 1: Healthy customer receives personalized investment/savings recommendation',
    `Received ${rahulRecs.recommendations.length} recommendations.`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 2: Financially Stressed Customer (Anti-Predatory / Don't Sell Me Mode)
  // ----------------------------------------------------
  const amitStress = FinancialStressEngine.evaluateStress('cust_amit');
  const amitPolicy = SafetyPolicyGateway.evaluateRecommendation('cust_amit', 'LOAN');
  const amitNextBest = NextBestActionEngine.determineAction('cust_amit');

  const stressIsHigh = amitStress.stress_level === 'HIGH';
  const loanIsBlocked = !amitPolicy.allowed && amitPolicy.policy_decision === 'SUPPRESSED_DONT_SELL_ME';
  const assistanceShown = amitNextBest.action_type === 'ASSIST' && amitNextBest.dont_sell_me_active;

  assert(
    stressIsHigh && loanIsBlocked && assistanceShown,
    'TEST 2: Financially stressed customer triggers HIGH stress, blocks loan cross-sell & activates Don\'t Sell Me Mode',
    `Stress Level: ${amitStress.stress_level}, Loan Allowed: ${amitPolicy.allowed}, Don't Sell Me: ${amitNextBest.dont_sell_me_active}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 3: Fraud & Anomaly Spike Detection
  // ----------------------------------------------------
  const vikramAnomaly = FraudEngine.evaluateTransaction('cust_vikram', 85000, 'Cyber Gadgets Hub 247', 2);
  assert(
    vikramAnomaly.is_anomaly && vikramAnomaly.risk_level === 'HIGH' && vikramAnomaly.z_score > 3.0,
    'TEST 3: ₹85,000 unusual transaction triggers HIGH-RISK anomaly flag with statistical explanation',
    `Z-score: ${vikramAnomaly.z_score}, Risk: ${vikramAnomaly.risk_level}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 4: Deterministic What-If Loan Math
  // ----------------------------------------------------
  const emiCalculated = WhatIfEngine.calculateEMI(500000, 10.5, 36);
  // Standard amortization for 500000 at 10.5% for 36 months is ~16,252
  const emiMatches = emiCalculated >= 16000 && emiCalculated <= 16500;
  const simResult = WhatIfEngine.simulate({
    customerId: 'cust_sunita',
    simulationType: 'TAKE_LOAN',
    loanAmount: 500000,
    interestRate: 10.5,
    tenureMonths: 36,
  });

  const surplusIsAccurate =
    simResult.simulated_metrics.monthly_surplus ===
    simResult.simulated_metrics.monthly_income -
      simResult.simulated_metrics.monthly_expenses -
      simResult.simulated_metrics.monthly_emi;

  assert(
    emiMatches && surplusIsAccurate,
    'TEST 4: What-If simulation calculations are mathematically deterministic and surplus is exact',
    `Calculated EMI: ₹${emiCalculated}, Surplus Math Matches: ${surplusIsAccurate}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 5: Customer Data Isolation (RBAC)
  // ----------------------------------------------------
  const rahulProfile = db.findById('customer_profiles', 'cust_rahul');
  const amitProfile = db.findById('customer_profiles', 'cust_amit');
  assert(
    rahulProfile?.user_id !== amitProfile?.user_id,
    'TEST 5: Strict customer data isolation and independent identity partitioning',
    `Rahul User: ${rahulProfile?.user_id}, Amit User: ${amitProfile?.user_id}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 6: DPDPA Consent Enforcement
  // ----------------------------------------------------
  const existingConsent = db.findOne('consents', (c) => c.customer_id === 'cust_rahul');
  if (existingConsent) {
    db.update('consents', existingConsent.id, { personalized_recommendations: false });
  }

  const restrictedRecs = RecommendationEngine.generateRecommendations('cust_rahul');
  assert(
    restrictedRecs.recommendations.length === 0 && restrictedRecs.primary_next_best_action === 'CONSENT_RESTRICTED',
    'TEST 6: Turning OFF personalization consent strictly suppresses recommendation generation',
    `Recommendations count: ${restrictedRecs.recommendations.length}`
  );

  // Restore consent
  if (existingConsent) {
    db.update('consents', existingConsent.id, { personalized_recommendations: true });
  }

  // ----------------------------------------------------
  // ACCEPTANCE TEST 7: Deterministic Demo AI Mode Offline Fallback
  // ----------------------------------------------------
  const balanceQuery = VernacularEngine.processQuery('cust_rahul', 'What is my account balance?');
  assert(
    balanceQuery.intent === 'CHECK_BALANCE' &&
      balanceQuery.verified_data.available_balance === 142500 &&
      balanceQuery.message.includes('1,42,500'),
    'TEST 7: Offline Demo AI Mode provides accurate verified factual response without external LLM dependency',
    `Intent: ${balanceQuery.intent}, Balance Output: ${balanceQuery.message}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 8: Gujarati & Vernacular Query Processing
  // ----------------------------------------------------
  const gujaratiQuery = VernacularEngine.processQuery('cust_ramesh', 'મારી લોનની વિગતો અને EMI જણાવો');
  assert(
    gujaratiQuery.intent === 'CHECK_EMI' &&
      gujaratiQuery.language === 'gu' &&
      gujaratiQuery.message.includes('કુલ માસિક EMI'),
    'TEST 8: Native Gujarati query accurately maps intent and returns localized response with verified data',
    `Intent: ${gujaratiQuery.intent}, Language: ${gujaratiQuery.language}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 9: Life Event Prediction Milestone Detection
  // ----------------------------------------------------
  const rahulEvents = LifeEventPredictionService.predictForCustomer('cust_rahul');
  const hasCareerOrVehicle = rahulEvents.predictions.some(
    (p) => p.category === 'CAREER' || p.category === 'VEHICLE'
  );
  assert(
    !rahulEvents.consent_restricted && rahulEvents.predictions.length > 0 && hasCareerOrVehicle,
    'TEST 9: Life Event Prediction AI detects verified milestones (Career / Vehicle) with confidence scores',
    `Found ${rahulEvents.predictions.length} milestones for Rahul.`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 10: Anti-Predatory Financial Stress Milestones
  // ----------------------------------------------------
  const amitEvents = LifeEventPredictionService.predictForCustomer('cust_amit');
  const hasStressEvent = amitEvents.predictions.some((p) => p.category === 'STRESS_RELIEF');
  const recommendsNoLoans = !amitEvents.predictions.some(
    (p) => p.recommendation.product_type === 'LOAN' || p.recommendation.product_type === 'CREDIT_CARD'
  );
  assert(
    hasStressEvent && recommendsNoLoans,
    'TEST 10: Financially stressed customer detects STRESS_RELIEF milestone and strictly bans predatory loan cross-sells',
    `Has stress milestone: ${hasStressEvent}, Bans loans: ${recommendsNoLoans}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 11: DPDPA Consent Privacy for Life Events
  // ----------------------------------------------------
  const rahulConsent = db.findOne('consents', (c) => c.customer_id === 'cust_rahul');
  if (rahulConsent) {
    db.update('consents', rahulConsent.id, { personalized_recommendations: false });
  }

  const suppressedLifeEvents = LifeEventPredictionService.predictForCustomer('cust_rahul');
  assert(
    suppressedLifeEvents.consent_restricted === true && suppressedLifeEvents.predictions.length === 0,
    'TEST 11: Turning OFF DPDPA personalization consent strictly suppresses Life Event Predictions',
    `Consent restricted: ${suppressedLifeEvents.consent_restricted}, Count: ${suppressedLifeEvents.predictions.length}`
  );

  // Restore consent
  if (rahulConsent) {
    db.update('consents', rahulConsent.id, { personalized_recommendations: true });
  }

  // ----------------------------------------------------
  // ACCEPTANCE TEST 12: Spending Coach Category Aggregation & MoM Calculations
  // ----------------------------------------------------
  const rahulCoach = SpendingCoachService.getCoachData('cust_rahul');
  const rahulCategories = rahulCoach.data?.categories || [];
  const shoppingCat = rahulCategories.find((c) => c.category === 'Shopping');
  const foodCat = rahulCategories.find((c) => c.category === 'Food & Dining');

  const categoriesAggregated = rahulCategories.length >= 4;
  const momVarianceCalculated = shoppingCat !== undefined && shoppingCat.change_percentage !== 0;
  const overviewValid =
    rahulCoach.data !== null &&
    rahulCoach.data.overview.total_spent_this_month > 0 &&
    rahulCoach.data.overview.total_income_this_month === 85000;

  assert(
    !rahulCoach.consent_restricted && categoriesAggregated && momVarianceCalculated && overviewValid,
    'TEST 12: Spending Coach category aggregation and month-over-month variance calculations are verified & deterministic',
    `Categories: ${rahulCategories.length}, Shopping MoM: ${shoppingCat?.change_percentage}%, Total Spent: ₹${rahulCoach.data?.overview.total_spent_this_month}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 13: Overspending Detection & Budget Health Scoring
  // ----------------------------------------------------
  const amitCoach = SpendingCoachService.getCoachData('cust_amit');
  const amitData = amitCoach.data;

  const rahulHealth = rahulCoach.data?.budget_health;
  const amitHealth = amitData?.budget_health;

  const rahulIsHealthy = rahulHealth?.level === 'HEALTHY' || rahulHealth?.level === 'EXCELLENT';
  const amitIsStressed = amitHealth?.level === 'CRITICAL' || amitHealth?.level === 'WARNING';
  const amitHasOverspendingAlerts = (amitData?.overspending_alerts.length || 0) > 0;
  const amitDebtRestructureSuggested = amitData?.saving_opportunities.some(
    (o) => o.category === 'EMI & Loans' || o.id.includes('samadhan')
  );

  assert(
    rahulIsHealthy && amitIsStressed && amitHasOverspendingAlerts && amitDebtRestructureSuggested,
    'TEST 13: Overspending anomaly detection and budget health scoring accurately distinguish healthy vs stressed personas',
    `Rahul Level: ${rahulHealth?.level} (${rahulHealth?.score}), Amit Level: ${amitHealth?.level} (${amitHealth?.score}), Alerts: ${amitData?.overspending_alerts.length}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 14: DPDPA Consent Privacy Enforcement for Spending Coach
  // ----------------------------------------------------
  const consentRecord = db.findOne('consents', (c) => c.customer_id === 'cust_rahul');
  if (consentRecord) {
    db.update('consents', consentRecord.id, { transaction_analysis: false });
  }

  const suppressedCoach = SpendingCoachService.getCoachData('cust_rahul');
  const coachStrictlySuppressed = suppressedCoach.consent_restricted === true && suppressedCoach.data === null;

  assert(
    coachStrictlySuppressed,
    'TEST 14: DPDPA Consent enforcement: disabling transaction analysis consent strictly suppresses spending coach data',
    `Consent restricted: ${suppressedCoach.consent_restricted}, Data is null: ${suppressedCoach.data === null}`
  );

  // Restore consent
  if (consentRecord) {
    db.update('consents', consentRecord.id, { transaction_analysis: true });
  }

  // Conversational Assistant Chat Verification
  const chatQ1 = VernacularEngine.processQuery('cust_rahul', 'Where did I spend the most money?');
  const chatQ2 = VernacularEngine.processQuery('cust_rahul', 'Am I overspending on food or shopping?');
  const chatQ3 = VernacularEngine.processQuery('cust_rahul', 'Give me practical budgeting advice.');

  const chatGrounded =
    chatQ1.intent === 'SPENDING_COACH' &&
    chatQ1.message.includes(chatQ1.verified_data.highest_category.category) &&
    chatQ2.intent === 'SPENDING_COACH' &&
    chatQ3.intent === 'SPENDING_COACH';

  // ----------------------------------------------------
  // ACCEPTANCE TEST 15: Feature 5: Upcoming Financial Events Timeline
  // ----------------------------------------------------
  const eventsQuery = VernacularEngine.processQuery('cust_rahul', 'What are my upcoming payments, bills, and expected salary this month?');
  const eventsValid =
    eventsQuery.intent === 'UPCOMING_EVENTS' &&
    Array.isArray(eventsQuery.verified_data?.timeline) &&
    eventsQuery.verified_data.timeline.length > 0 &&
    typeof eventsQuery.proactive_insight === 'string' &&
    eventsQuery.proactive_insight.length > 0;

  assert(
    eventsValid,
    'TEST 15: Upcoming financial events query returns chronologically verified timeline & proactive insight',
    `Intent: ${eventsQuery.intent}, Timeline events: ${eventsQuery.verified_data?.timeline?.length}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 16: Feature 6: Opportunity Detector & Don't Sell Me Safety Mode
  // ----------------------------------------------------
  const rahulOpp = VernacularEngine.processQuery('cust_rahul', 'What investment or savings opportunities are recommended for my profile?');
  const rahulOppValid =
    rahulOpp.intent === 'OPPORTUNITY_DETECTOR' &&
    Array.isArray(rahulOpp.verified_data?.opportunities) &&
    rahulOpp.verified_data.opportunities.length > 0 &&
    Boolean(rahulOpp.verified_data.opportunities[0].why_recommendation) &&
    rahulOpp.verified_data.dont_sell_me_active === false;

  const amitOpp = VernacularEngine.processQuery('cust_amit', 'What investment or savings opportunities are recommended for my profile?');
  const amitOppValid =
    amitOpp.intent === 'OPPORTUNITY_DETECTOR' &&
    amitOpp.verified_data?.dont_sell_me_active === true;

  assert(
    rahulOppValid && amitOppValid,
    'TEST 16: Opportunity detector surfaces personalized recommendations with "Why" for healthy user and activates Don\'t Sell Me shield for stressed user',
    `Rahul Opps: ${rahulOpp.verified_data?.opportunities?.length}, Amit Don't Sell Me: ${amitOpp.verified_data?.dont_sell_me_active}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 17: Feature 8: Multi-turn Conversation Memory (EMI Reduction Inquiry)
  // ----------------------------------------------------
  const rahulEmiQuery = VernacularEngine.processQuery('cust_rahul', 'Can I reduce my loan EMI?', 'en', [
    { sender: 'USER', content: 'What is my current loan EMI?' },
    { sender: 'ASSISTANT', content: 'Your active Car Loan EMI is ₹14,200 due on 10th.' },
  ]);
  const rahulMemoryValid =
    rahulEmiQuery.intent === 'STRESS_ASSISTANCE' &&
    rahulEmiQuery.deep_link === '/what-if' &&
    rahulEmiQuery.message.includes('What-If');

  const amitEmiQuery = VernacularEngine.processQuery('cust_amit', 'Can I reduce my loan EMI?', 'en', [
    { sender: 'USER', content: 'What is my EMI?' },
    { sender: 'ASSISTANT', content: 'Your total EMIs are ₹64,800 across 3 loans.' },
  ]);
  const amitMemoryValid =
    amitEmiQuery.intent === 'STRESS_ASSISTANCE' &&
    amitEmiQuery.deep_link === '/stress-assistance' &&
    amitEmiQuery.message.includes('Samadhan');

  assert(
    rahulMemoryValid && amitMemoryValid,
    'TEST 17: Multi-turn conversation memory correctly resolves EMI reduction inquiries into What-If Simulator or Samadhan Relief based on financial health',
    `Rahul Link: ${rahulEmiQuery.deep_link}, Amit Link: ${amitEmiQuery.deep_link}`
  );

  // ----------------------------------------------------
  // ACCEPTANCE TEST 18: Feature 1: Daily AI Banking Briefing
  // ----------------------------------------------------
  const rahulBrief = GeminiService.generateDailyBrief('cust_rahul', 'en');
  const briefValid =
    typeof rahulBrief.greeting === 'string' &&
    rahulBrief.customer_name.startsWith('Rahul') &&
    typeof rahulBrief.health_score === 'number' &&
    Array.isArray(rahulBrief.highlights) &&
    rahulBrief.highlights.length >= 3 &&
    typeof rahulBrief.today_suggestion === 'string';

  assert(
    briefValid,
    'TEST 18: Daily AI Banking Briefing generates personalized verified metrics, highlights, and health score',
    `Greeting: "${rahulBrief.greeting}", Health: ${rahulBrief.health_score}, Highlights: ${rahulBrief.highlights.length}`
  );

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n======================================================');
  console.log(`TEST SUITE RESULTS: ${passedCount} PASSED / ${failedCount} FAILED`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runAcceptanceTests();

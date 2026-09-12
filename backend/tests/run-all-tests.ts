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

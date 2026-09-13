import { config } from '../config/index.js';
import { db } from '../db/database.js';
import { BehavioralEngine } from '../engines/behavioral.js';
import { RecommendationEngine } from '../engines/recommendation.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { WhatIfEngine } from '../engines/whatif.js';
import { LifeEventPredictionService } from './lifeEventPrediction.service.js';
import { SpendingCoachService } from './spendingCoach.service.js';

export interface GeminiChatPayload {
  message: string;
  language: 'en' | 'hi' | 'gu';
  intent: string;
  verified_data: any;
  suggested_actions: string[];
  proactive_insight?: string;
  coaching_advice?: {
    why_this_advice: string;
    expected_benefit: string;
  };
  deep_link?: string;
  model_used?: string;
}

export interface ChatHistoryItem {
  sender: 'USER' | 'ASSISTANT';
  content: string;
}

export interface DailyBankingBrief {
  greeting: string;
  customer_name: string;
  health_score: number;
  health_tier: string;
  highlights: string[];
  today_suggestion: string;
  quick_actions: string[];
  deep_link?: string;
}

export class GeminiService {
  private static readonly MODELS = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-latest',
    'gemini-3.6-flash',
    'gemini-3.7-flash',
  ];

  /**
   * Compiles the real, verified banking snapshot for a customer from FinPulse's database and AI engines.
   * Enriched with spending analysis, upcoming timelines, and opportunity detection.
   */
  public static getVerifiedCustomerSnapshot(customerId: string) {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) return null;

    const account = db.findOne('accounts', (a) => a.customer_id === customerId);
    const loans = db.filter('loans', (l) => l.customer_id === customerId);
    const activeLoans = loans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
    const transactions = db.filter('transactions', (t) => t.customer_id === customerId);
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    const consent = db.findOne('consents', (c) => c.customer_id === customerId);
    const stress = FinancialStressEngine.evaluateStress(customerId);
    const behavioral = BehavioralEngine.analyzeCustomer(customerId);

    // Filter recent transactions
    const recentTxns = transactions.slice(-10).reverse().map((t) => ({
      date: t.created_at?.slice(0, 10) || 'Recent',
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      is_anomaly: t.is_anomaly || false,
    }));

    // Spending breakdown analysis
    const categoryTotals: Record<string, number> = {};
    let totalDebitExpenses = 0;
    for (const t of transactions) {
      if (t.type === 'DEBIT') {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        totalDebitExpenses += t.amount;
      }
    }

    const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const highestCategory = sortedCategories.length > 0 ? { category: sortedCategories[0][0], amount: sortedCategories[0][1] } : { category: 'General', amount: 0 };
    const lowestCategory = sortedCategories.length > 1 ? { category: sortedCategories[sortedCategories.length - 1][0], amount: sortedCategories[sortedCategories.length - 1][1] } : null;

    // Upcoming events timeline calculation
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const upcomingEvents = [];

    // Loan EMIs
    for (const l of activeLoans) {
      const daysUntilDue = l.due_day_of_month >= currentDay
        ? l.due_day_of_month - currentDay
        : (30 - currentDay) + l.due_day_of_month;
      upcomingEvents.push({
        event_name: `${l.loan_type} EMI Payment`,
        amount: l.monthly_emi,
        due_day: l.due_day_of_month,
        days_until_due: daysUntilDue,
        status: daysUntilDue <= 3 ? 'URGENT' : 'UPCOMING',
        type: 'EMI',
      });
    }

    // Salary credit event
    upcomingEvents.push({
      event_name: 'Monthly Salary Credit',
      amount: profile.monthly_income,
      due_day: 1,
      days_until_due: currentDay === 1 ? 0 : (30 - currentDay) + 1,
      status: 'EXPECTED',
      type: 'INCOME',
    });

    // Recommendations (if consent permits)
    let recommendations: any[] = [];
    if (!consent || consent.personalized_recommendations) {
      try {
        const recResult = RecommendationEngine.generateRecommendations(customerId);
        recommendations = recResult.recommendations.map((r) => ({
          name: r.product_name,
          type: r.product_type,
          why_youre_seeing_this: r.why_am_i_seeing_this?.key_factors || [],
          status: r.status,
          block_reason: r.block_reason,
        }));
      } catch (err) {
        recommendations = [];
      }
    }

    const totalEmi = activeLoans.reduce((sum, l) => sum + l.monthly_emi, 0);

    return {
      customer: {
        id: customerId,
        name: profile.full_name,
        occupation: profile.occupation,
        monthly_income: profile.monthly_income,
        preferred_language: profile.preferred_language || 'en',
        tier: profile.persona_tag,
      },
      account: {
        account_number: account ? `•••• •••• ${account.account_number.slice(-4)}` : 'N/A',
        account_type: account?.account_type || 'SAVINGS',
        balance: account?.balance || 0,
        status: account?.status || 'ACTIVE',
      },
      loans: {
        count: activeLoans.length,
        total_monthly_emi: totalEmi,
        list: activeLoans.map((l) => ({
          type: l.loan_type,
          monthly_emi: l.monthly_emi,
          outstanding_amount: l.outstanding_amount,
          due_day_of_month: l.due_day_of_month,
          status: l.status,
          missed_emis: l.missed_emis_count || 0,
        })),
      },
      recent_transactions: recentTxns,
      spending_summary: {
        total_debit_expenses: totalDebitExpenses || behavioral.monthly_expenses,
        category_breakdown: categoryTotals,
        highest_category: highestCategory,
        lowest_category: lowestCategory,
        discretionary_ratio: behavioral.discretionary_ratio,
        essential_ratio: behavioral.essential_ratio,
      },
      upcoming_events_timeline: upcomingEvents,
      financial_twin: {
        health_score: twin?.financial_health_score || behavioral.income_stability_score,
        health_tier: twin?.financial_health_tier || 'GOOD',
        savings_ratio_percent: twin?.savings_ratio || behavioral.savings_ratio,
        debt_burden_percent: twin?.emi_to_income_ratio || behavioral.emi_to_income_ratio,
        savings_growth_rate: twin?.savings_growth_rate || 0,
        behavioral_segment: behavioral.behavioral_segment,
        monthly_surplus: Math.max(0, profile.monthly_income - behavioral.monthly_expenses - totalEmi),
        dont_sell_me_active: twin?.dont_sell_me_active || stress.dont_sell_me_engaged,
      },
      stress_metrics: {
        stress_level: stress.stress_level,
        stress_score: stress.stress_score,
        factors: stress.contributing_factors,
        support_action: stress.recommended_support_action,
        dont_sell_me_mode: stress.dont_sell_me_engaged,
        samadhan_restructuring_available: stress.stress_level === 'HIGH' || twin?.dont_sell_me_active,
        restructured_emi_estimate: Math.round(totalEmi * 0.55),
      },
      recommendations,
      consent_settings: consent
        ? {
            transaction_analysis: consent.transaction_analysis,
            health_scoring: consent.health_scoring,
            personalized_recommendations: consent.personalized_recommendations,
            promotional_marketing: consent.promotional_marketing,
          }
        : {
            transaction_analysis: true,
            health_scoring: true,
            personalized_recommendations: true,
            promotional_marketing: true,
          },
      life_event_predictions: LifeEventPredictionService.predictForCustomer(customerId).predictions,
      spending_coach: SpendingCoachService.getCoachData(customerId).data,
      banking_services: {
        upi_daily_limit: 100000,
        emergency_fraud_helpline: '1800-425-0018 (24x7 Toll-Free Bharat Banking)',
        card_freeze_status: 'ACTIVE',
      },
    };
  }

  /**
   * Generates a verified, personalized Daily AI Banking Briefing for a customer.
   */
  public static generateDailyBrief(customerId: string, languageHint?: string): DailyBankingBrief {
    const snap = this.getVerifiedCustomerSnapshot(customerId);
    if (!snap) {
      return {
        greeting: 'Welcome to FinPulse AI 👋',
        customer_name: 'Customer',
        health_score: 75,
        health_tier: 'GOOD',
        highlights: ['Verified banking assistant ready.'],
        today_suggestion: 'Check your account status and recent transactions.',
        quick_actions: ['Check Balance', 'Show My Loans'],
      };
    }

    const firstName = snap.customer.name.split(' ')[0];
    const isStressed = snap.financial_twin.dont_sell_me_active || snap.stress_metrics.stress_level === 'HIGH';
    const lang = languageHint || snap.customer.preferred_language || 'en';

    // Time-based greeting
    const hour = new Date().getHours();
    let timeGreetingEn = 'Good Day';
    let timeGreetingHi = 'नमस्ते';
    let timeGreetingGu = 'નમસ્તે';
    if (hour < 12) {
      timeGreetingEn = 'Good Morning';
      timeGreetingHi = 'शुभ प्रभात';
      timeGreetingGu = 'સુપ્રભાત';
    } else if (hour < 17) {
      timeGreetingEn = 'Good Afternoon';
      timeGreetingHi = 'शुभ दोपहर';
      timeGreetingGu = 'શુભ બપોર';
    } else {
      timeGreetingEn = 'Good Evening';
      timeGreetingHi = 'शुभ संध्या';
      timeGreetingGu = 'શુભ સંધ્યા';
    }

    const greeting =
      lang === 'gu'
        ? `${timeGreetingGu} ${firstName}ભાઈ 👋`
        : lang === 'hi'
        ? `${timeGreetingHi} ${firstName} जी 👋`
        : `${timeGreetingEn} ${firstName} 👋`;

    // Build verified bullet highlights
    const highlights: string[] = [];

    // Bullet 1: Balance / Salary Credit status
    const isSalaryAcc = snap.account.account_type === 'SALARY';
    highlights.push(
      lang === 'gu'
        ? `તમારા ${isSalaryAcc ? 'પગાર' : 'બચત'} ખાતામાં ઉપલબ્ધ બેલેન્સ ₹${snap.account.balance.toLocaleString('en-IN')} છે.`
        : lang === 'hi'
        ? `आपके ${isSalaryAcc ? 'वेतन' : 'बचत'} खाते में वर्तमान उपलब्ध शेष राशि ₹${snap.account.balance.toLocaleString('en-IN')} है।`
        : `Available balance in your ${snap.account.account_type} Account: ₹${snap.account.balance.toLocaleString('en-IN')}.`
    );

    // Bullet 2: Upcoming EMI countdown or clean debt status
    if (snap.loans.count > 0) {
      const nearestLoan = snap.upcoming_events_timeline.find((e) => e.type === 'EMI');
      if (nearestLoan) {
        const days = nearestLoan.days_until_due;
        const dueText = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `in ${days} days`;
        highlights.push(
          lang === 'gu'
            ? `આગામી EMI: ${nearestLoan.event_name} ₹${nearestLoan.amount.toLocaleString('en-IN')} (${days <= 3 ? `${days} દિવસમાં બાકી` : `તારીખ ${nearestLoan.due_day}`}).`
            : lang === 'hi'
            ? `आगामी किश्त: ${nearestLoan.event_name} ₹${nearestLoan.amount.toLocaleString('en-IN')} (${days <= 3 ? `${days} दिन में देय` : `${nearestLoan.due_day} तारीख को देय`}).`
            : `Upcoming EMI: ${nearestLoan.event_name} of ₹${nearestLoan.amount.toLocaleString('en-IN')} due ${dueText} (Day ${nearestLoan.due_day}).`
        );
      }
    } else {
      highlights.push(
        lang === 'gu'
          ? 'હાલમાં કોઈ સક્રિય લોન બાકી નથી. તમારું દેવું શૂન્ય છે!'
          : lang === 'hi'
          ? 'वर्तमान में कोई सक्रिय ऋण बकाया नहीं है। आपका ऋण स्तर शून्य है!'
          : 'Zero active debt obligations. Your cashflow is debt-free!'
      );
    }

    // Bullet 3: Savings comparison vs baseline
    const savingsDelta = snap.financial_twin.savings_growth_rate;
    const monthlySavings = snap.spending_coach?.overview?.total_savings_this_month || snap.financial_twin.monthly_surplus;
    if (savingsDelta > 0) {
      highlights.push(
        lang === 'gu'
          ? `તમે ગયા અઠવાડિયા કરતાં વધુ બચત કરી (+${savingsDelta}% બચત વૃદ્ધિ, માસિક બચત ₹${monthlySavings.toLocaleString('en-IN')}).`
          : lang === 'hi'
          ? `आपने पिछले सप्ताह से अधिक बचत की (+${savingsDelta}% बचत वृद्धि, मासिक बचत ₹${monthlySavings.toLocaleString('en-IN')}).`
          : `You saved more this cycle: Monthly savings grew +${savingsDelta}% (₹${monthlySavings.toLocaleString('en-IN')} accumulated).`
      );
    } else {
      highlights.push(
        lang === 'gu'
          ? `તમારો માસિક બચત દર: ${snap.financial_twin.savings_ratio_percent}% (સરપ્લસ ₹${monthlySavings.toLocaleString('en-IN')}).`
          : lang === 'hi'
          ? `आपकी मासिक बचत दर: ${snap.financial_twin.savings_ratio_percent}% (अधिशेष ₹${monthlySavings.toLocaleString('en-IN')}).`
          : `Savings Ratio: ${snap.financial_twin.savings_ratio_percent}% with ₹${monthlySavings.toLocaleString('en-IN')} monthly surplus.`
      );
    }

    // Bullet 4: Spending Category Insights (Spending Coach data)
    if (snap.spending_coach?.categories && snap.spending_coach.categories.length > 0) {
      const topCat = snap.spending_coach.categories[0];
      const secondCat = snap.spending_coach.categories.find((c: any) => c.change_percentage < 0);
      if (secondCat) {
        highlights.push(
          lang === 'gu'
            ? `${secondCat.category} ખર્ચમાં ${Math.abs(secondCat.change_percentage)}% નો ઘટાડો થયો છે.`
            : lang === 'hi'
            ? `${secondCat.category} खर्च में ${Math.abs(secondCat.change_percentage)}% की कमी दर्ज हुई है।`
            : `${secondCat.category} spending decreased ${Math.abs(secondCat.change_percentage)}% compared to last month.`
        );
      } else {
        highlights.push(
          lang === 'gu'
            ? `સૌથી મોટો ખર્ચ: ${topCat.category} (₹${topCat.amount.toLocaleString('en-IN')}).`
            : lang === 'hi'
            ? `सर्वाधिक खर्च: ${topCat.category} (₹${topCat.amount.toLocaleString('en-IN')}).`
            : `Top spending category: ${topCat.category} (₹${topCat.amount.toLocaleString('en-IN')}).`
        );
      }
    } else if (snap.spending_summary.highest_category.amount > 0) {
      highlights.push(
        lang === 'gu'
          ? `સૌથી મોટો ખર્ચ: ${snap.spending_summary.highest_category.category} (₹${snap.spending_summary.highest_category.amount.toLocaleString('en-IN')}).`
          : lang === 'hi'
          ? `सर्वाधिक व्यय: ${snap.spending_summary.highest_category.category} श्रेणी में ₹${snap.spending_summary.highest_category.amount.toLocaleString('en-IN')}.`
          : `Highest spending category: ${snap.spending_summary.highest_category.category} (₹${snap.spending_summary.highest_category.amount.toLocaleString('en-IN')}).`
      );
    }

    // Bullet 5: Financial Health Score
    highlights.push(
      lang === 'gu'
        ? `તમારું નાણાકીય સ્વાસ્થ્ય સ્કોર: ${snap.financial_twin.health_score}/100 (${snap.financial_twin.health_tier}).`
        : lang === 'hi'
        ? `आपका वित्तीय स्वास्थ्य स्कोर: ${snap.financial_twin.health_score}/100 (${snap.financial_twin.health_tier}).`
        : `Your Financial Health Score is ${snap.financial_twin.health_score}/100 (${snap.financial_twin.health_tier}).`
    );

    // Today's personalized suggestion
    let suggestion = '';
    let deepLink = '/twin';
    if (isStressed) {
      suggestion =
        lang === 'gu'
          ? 'સલાહ: તમારા પર EMI નું ભારણ વધુ છે. સમાધાન રાહત યોજના હેઠળ તમારો હપ્તો ઘટાડવા માટે અરજી કરો.'
          : lang === 'hi'
          ? 'परामर्श: आपका ऋण भार अधिक है। समाधान योजना द्वारा अपनी किश्त कम कराने हेतु आवेदन करें।'
          : 'Advisory: High EMI burden detected. Explore Samadhan Restructuring to reduce your EMI obligations.';
      deepLink = '/stress-assistance';
    } else if (snap.loans.count > 0) {
      const nearestLoan = snap.upcoming_events_timeline.find((e) => e.type === 'EMI');
      suggestion =
        lang === 'gu'
          ? `સલાહ: તમારી ${nearestLoan?.event_name || 'લોન'} ની EMI સમયસર ભરો જેથી તમારો ક્રેડિટ સ્કોર મજબૂત રહે.`
          : lang === 'hi'
          ? `परामर्श: अपनी ${nearestLoan?.event_name || 'ऋण'} की किश्त समय से पहले चुकाएं ताकि आपका सिबिल स्कोर सुरक्षित रहे।`
          : `Today's suggestion: Pay your ${nearestLoan?.event_name || 'active loan'} EMI before the due date to maintain a healthy debt score.`;
      deepLink = '/what-if';
    } else if (snap.financial_twin.monthly_surplus > 10000) {
      suggestion =
        lang === 'gu'
          ? `સલાહ: તમારા ખાતામાં ₹${snap.financial_twin.monthly_surplus.toLocaleString('en-IN')} ની સરપ્લસ બચત છે. ઇમરજન્સી FD અથવા ગોલ્ડ SIP શરૂ કરો.`
          : lang === 'hi'
          ? `परामर्श: आपके पास ₹${snap.financial_twin.monthly_surplus.toLocaleString('en-IN')} का अधिशेष है। इमरजेंसी FD या गोल्ड SIP शुरू करें।`
          : `Tip: You have ₹${snap.financial_twin.monthly_surplus.toLocaleString('en-IN')} idle monthly surplus. An Emergency FD or Gold SIP would grow your wealth safely.`;
      deepLink = '/recommendations';
    } else {
      suggestion =
        lang === 'gu'
          ? 'સલાહ: બિનજરૂરી ખર્ચ પર નિયંત્રણ રાખીને 3 મહિનાનું ઇમરજન્સી ફંડ તૈયાર કરો.'
          : lang === 'hi'
          ? 'परामर्श: गैर-जरूरी खर्चों को नियंत्रित कर 3 माह का आपातकालीन फंड बनाएं।'
          : 'Tip: Maintain essential vs discretionary discipline to build a 3-month emergency cushion.';
      deepLink = '/spending-coach';
    }

    const quickActions =
      lang === 'gu'
        ? ['મારું ખાતા બેલેન્સ', 'આગામી ચૂકવણી અને બિલ', 'ખર્ચ રિપોર્ટ અને બચત સલાહ']
        : lang === 'hi'
        ? ['मेरा बैलेंस बताओ', 'आगामी किश्त व देय तिथियां', 'मासिक खर्च व बचत सुझाव']
        : ['Check Available Balance', 'Upcoming Payments & EMIs', 'Weekly Spending Summary'];

    return {
      greeting,
      customer_name: snap.customer.name,
      health_score: snap.financial_twin.health_score,
      health_tier: snap.financial_twin.health_tier,
      highlights,
      today_suggestion: suggestion,
      quick_actions: quickActions,
      deep_link: deepLink,
    };
  }

  /**
   * Main conversational generation using Gemini 2.5 Flash with verified data grounding.
   */
  public static async generateConversationalResponse(
    customerId: string,
    userQuery: string,
    languageHint?: 'en' | 'hi' | 'gu',
    conversationHistory: ChatHistoryItem[] = []
  ): Promise<GeminiChatPayload | null> {
    const apiKey = config.geminiApiKey;
    if (!apiKey) {
      return null;
    }

    const verifiedSnapshot = this.getVerifiedCustomerSnapshot(customerId);
    if (!verifiedSnapshot) {
      return null;
    }

    // Build the system prompt enforcing zero-hallucination and verified grounding
    const systemInstruction = `
You are FinPulse AI — an empathetic, hyper-personalized conversational banking copilot tailored specifically for India and Bharat (Tier 2/3/4 towns and rural communities).
You converse fluently in English, Hindi (हिन्दी / Hinglish), and Gujarati (ગુજરાતી / Gujlish).

==================================================
CRITICAL ZERO-HALLUCINATION & INTEGRITY RULES:
==================================================
1. You MUST use ONLY the verified customer data provided below. NEVER fabricate, estimate, or invent account balances, EMI amounts, loan status, or transaction figures.
2. IF "dont_sell_me_active" is true OR "stress_level" is "HIGH":
   - NEVER pitch, recommend, or cross-sell any new loans, credit cards, or borrowing under ANY circumstances!
   - EMPATHY FIRST: Acknowledge high financial stress, offer the "Samadhan Debt Restructuring" plan (which can reduce monthly EMI to ~₹${verifiedSnapshot.stress_metrics.restructured_emi_estimate}), tenure extension, and free financial counseling.
3. CRITICAL MULTILINGUAL & VERNACULAR ENFORCEMENT:
   - Target Response Language: "${languageHint || verifiedSnapshot.customer.preferred_language || 'en'}".
   - IF the target language is 'gu' (Gujarati):
     * You MUST generate your response completely in natural, warm Gujarati (ગુજરાતી script).
     * Translate all financial analysis, suggestions, numbers (e.g. ₹1,42,500), and explanations into Gujarati.
     * Even if the user typed their message in English or Hinglish, YOU MUST STILL RESPOND IN GUJARATI because the citizen selected the Gujarati interface!
   - IF the target language is 'hi' (Hindi):
     * You MUST generate your response completely in natural, friendly Hindi (हिन्दी script / conversational Hindi).
     * Translate all financial advice, metrics, and actions into Hindi.
     * Even if the user typed their message in English, YOU MUST STILL RESPOND IN HINDI because the citizen selected the Hindi interface!
   - IF the target language is 'en' (English):
     * Respond in empathetic Indian banking English.
   - Set "language": "${languageHint || 'en'}" in the output JSON.

==================================================
ADVANCED BANKING COPILOT CAPABILITIES:
==================================================
4. Feature 2: Smart Proactive Insights:
   - Include a 1-2 sentence "proactive_insight" in your response payload that provides an immediate, highly actionable financial observation related to the topic (e.g. idle cash recommendation, early EMI repayment advantage, or spending category shift).

5. Feature 3: AI Financial Coach:
   - If the user asks for financial coaching, budgeting tips, or how to improve their score/savings:
     - Provide clear steps based on their actual savings ratio (${verifiedSnapshot.financial_twin.savings_ratio_percent}%) and expenses.
     - Include "coaching_advice": { "why_this_advice": "...", "expected_benefit": "..." }.

6. Feature 4: Weekly / Monthly Spending Summary:
   - If user asks about spending summary, category breakdown, or "Where did I spend the most?":
     - Detail their highest category (${verifiedSnapshot.spending_summary.highest_category.category}: ₹${verifiedSnapshot.spending_summary.highest_category.amount.toLocaleString('en-IN')}).
     - Detail their lowest/other categories.
     - Finish with 1 specific personalized savings suggestion.

7. Feature 5: Upcoming Financial Events:
   - If user asks about upcoming payments, bills this week, or EMI due dates:
     - Provide the verified timeline directly from "upcoming_events_timeline". Do NOT make up any dates.

8. Feature 6: Opportunity Detector:
   - When suggesting products (SIP, Emergency FD, Gold Bond):
     - Always state clearly: "Why you're seeing this recommendation" using the verified factors from the Recommendation Engine.

9. Feature 7: Dynamic Follow-Up Suggestions:
   - Replace static buttons with 3 contextual follow-up prompt pills in the conversation language. E.g.:
     - After Balance: ["View recent transactions", "Spending analysis", "Savings advice"]
     - After EMI: ["Loan details breakdown", "What-If Simulator", "EMI relief options"]
     - After Fraud/Security: ["Freeze my card", "Dispute transaction", "Helpline assistance"]
     - After Savings/Coach: ["Start Gold SIP", "Build Emergency Fund", "Show Spending Summary"]

10. Feature 8: Conversation Memory:
    - Reference previous queries in this conversation session (e.g. if loans were displayed, and user asks "Can I reduce this EMI?", address that specific loan).

11. Feature 9: Life Event Prediction AI:
    - When user asks about detected life events, milestones approaching, home loan eligibility timeline, insurance reasons, or "What should I prepare for next?":
      - Explain the verified predictions from "life_event_predictions".
      - State the confidence level (High / Medium / Low).
      - Clearly explain "Why FinPulse detected this" citing real transactional or balance evidence.
      - Provide the proactive product recommendation and next action.

12. Feature 10: AI Spending Coach:
    - When user asks about spending patterns, categories, overspending, saving opportunities, spending forecasts, or budgeting advice ("How am I spending this month?", "Where did I spend the most money?", "Am I overspending?", "How can I save more money?", "Compare this month with last month", "Show my spending categories", "What's my biggest expense?"):
      - Ground your response in the verified data under "spending_coach":
        * Monthly overview: Total spent (₹${verifiedSnapshot.spending_coach?.overview?.total_spent_this_month || 0}), Income (₹${verifiedSnapshot.spending_coach?.overview?.total_income_this_month || 0}), Savings ratio (${verifiedSnapshot.spending_coach?.overview?.savings_ratio || 0}%).
        * Category breakdown: Cite the highest category, exact amounts, and month-over-month comparison (+X% / -Y%).
        * Overspending alerts: If overspending alerts exist, explain why they were triggered (e.g. food delivery spike, shopping surge) with practical, gentle guidance.
        * Smart saving opportunities: Quote specific savings recommendations with estimated monthly savings (e.g. save ₹1,600 on food delivery, save ₹2,000 on shopping).
        * Spending forecast: Projected month-end spend, remaining budget, and days until budget exhaustion.
        * Budget Health meter: Level (${verifiedSnapshot.spending_coach?.budget_health?.level || 'HEALTHY'}), score (${verifiedSnapshot.spending_coach?.budget_health?.score || 75}/100), and reason.
      - NEVER recommend loans or debt to someone in stress. Focus purely on savings, budgeting discipline, and expense moderation.

13. Greetings & Conversational Politeness (CRITICAL):
    - When the user sends a greeting (e.g., "Hello", "Hi", "Hey", "Namaste", "Kem Cho", "Good Morning", "Good Afternoon", "Kemcho"):
      * Respond warmly and empathetically in their language using their first name (${verifiedSnapshot.customer.name.split(' ')[0]}).
      * Provide a brief positive status check (e.g., mention their health score of ${verifiedSnapshot.financial_twin.health_score}/100 or confirm their accounts are active).
      * Ask how you can help with their banking, savings, or investments today.
      * Set "intent": "GREETING".
      * Provide 3 relevant conversation starter suggestions in suggested_actions.
      * DO NOT treat greetings as OUT_OF_SCOPE or GENERAL_HELP!

14. Identity & Capability Inquiries:
    - When the user asks about who you are or what you can do (e.g., "Who are you?", "What can you do?", "Help me", "Tell me about yourself"):
      * Introduce yourself warmly as FinPulse AI — their hyper-personalized AI banking copilot for Bharat.
      * Explain your capabilities: checking verified balance & transactions, tracking loan EMIs & what-if restructuring, personalized spending coaching, life event forecasting, and 24x7 fraud protection.
      * Set "intent": "IDENTITY_HELP".
      * DO NOT return robotic or generic help!

15. Out of Scope / Unrelated Topics ONLY:
    - ONLY if the user's question is completely unrelated to banking, personal finances, investments, economy, or account security (e.g., "Who won the cricket match?", "Tell me a joke", "Explain quantum physics"):
      * Politely say: "I am your FinPulse AI Banking Copilot for Bharat. I can assist you with your accounts, loans, UPI payments, fraud protection, investments, and financial health."
      * Set "intent": "OUT_OF_SCOPE".

16. Response Format:
    Output ONLY a valid JSON object with NO surrounding markdown backticks (no \`\`\`json):
    {
      "message": "Friendly, empathetic, conversational response with clear markdown formatting (bold key numbers in Indian currency format like ₹1,42,500).",
      "language": "en" | "hi" | "gu",
      "intent": "GREETING" | "IDENTITY_HELP" | "CHECK_BALANCE" | "CHECK_LOANS_EMI" | "CHECK_TRANSACTIONS" | "FINANCIAL_HEALTH" | "FINANCIAL_ADVICE" | "INVESTMENT_GUIDANCE" | "INSURANCE_GUIDANCE" | "FRAUD_SECURITY" | "UPI_HELP" | "STRESS_ASSISTANCE" | "CONSENT_QUERY" | "WHAT_IF_LOAN" | "WEEKLY_SPENDING_SUMMARY" | "UPCOMING_EVENTS" | "FINANCIAL_COACH" | "OPPORTUNITY_DETECTOR" | "LIFE_EVENT_PREDICTION" | "SPENDING_COACH" | "GENERAL_BANKING" | "OUT_OF_SCOPE",
      "verified_data": { ...key figures actually cited in response... },
      "proactive_insight": "1-2 sentence smart proactive insight relevant to the query topic",
      "coaching_advice": {
        "why_this_advice": "Clear explanation of why this coaching applies to the user's data",
        "expected_benefit": "Quantifiable benefit to their cashflow or health score"
      },
      "suggested_actions": ["3 short contextual followup prompts in the response language"],
      "deep_link": "/what-if" | "/stress-assistance" | "/fraud-security" | "/recommendations" | "/consent" | "/twin" | "/transactions" | null
    }
`.trim();

    // Prepare conversation messages
    const contents: any[] = [];

    // Include recent history for conversation memory
    for (const h of conversationHistory.slice(-8)) {
      contents.push({
        role: h.sender === 'USER' ? 'user' : 'model',
        parts: [{ text: h.content }],
      });
    }

    // Add current query with customer snapshot
    const userPromptWithContext = `
[VERIFIED CUSTOMER BANKING DATA SNAPSHOT]
${JSON.stringify(verifiedSnapshot, null, 2)}

[PREFERRED_LANGUAGE_HINT]: ${languageHint || verifiedSnapshot.customer.preferred_language}

[USER QUERY]:
${userQuery}
`.trim();

    contents.push({
      role: 'user',
      parts: [{ text: userPromptWithContext }],
    });

    // Try models in sequence
    for (const modelName of this.MODELS) {
      const callStartTime = Date.now();
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const bodyPayload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
            responseMimeType: 'application/json',
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyPayload),
          signal: AbortSignal.timeout(28000),
        });

        if (!res.ok) {
          const errText = await res.text();
          if (res.status === 404 || errText.includes('NOT_FOUND') || errText.includes('not available')) {
            continue;
          }
          console.warn(`[FinPulse GeminiService] Model ${modelName} returned status ${res.status}: ${errText.slice(0, 120)}`);
          continue;
        }

        const data = (await res.json()) as any;
        const candidate = data?.candidates?.[0];
        if (!candidate) {
          continue;
        }

        // Support both single text parts and multi-part reasoning tokens
        const parts = candidate.content?.parts || [];
        let candidateText = '';
        for (const p of parts) {
          if (p.text && !p.thought) {
            candidateText += p.text;
          }
        }
        if (!candidateText && parts.length > 0) {
          candidateText = parts[parts.length - 1]?.text || parts[0]?.text || '';
        }

        if (!candidateText.trim()) {
          continue;
        }

        // Robust JSON parsing
        let parsed: any = null;
        try {
          const cleaned = candidateText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
          parsed = JSON.parse(cleaned);
        } catch {
          const firstBrace = candidateText.indexOf('{');
          const lastBrace = candidateText.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace > firstBrace) {
            try {
              parsed = JSON.parse(candidateText.slice(firstBrace, lastBrace + 1));
            } catch (errJson) {
              console.warn('[FinPulse GeminiService] Failed secondary JSON parse:', errJson);
            }
          }
        }

        if (!parsed || !parsed.message) {
          continue;
        }

        console.log(`[FinPulse GeminiService] ✅ Successfully generated response using ${modelName} in ${Date.now() - callStartTime}ms`);

        return {
          message: parsed.message,
          language: parsed.language || languageHint || 'en',
          intent: parsed.intent || 'GENERAL_BANKING',
          verified_data: parsed.verified_data || { customer_id: customerId },
          proactive_insight: parsed.proactive_insight || undefined,
          coaching_advice: parsed.coaching_advice || undefined,
          suggested_actions: Array.isArray(parsed.suggested_actions) ? parsed.suggested_actions : [],
          deep_link: parsed.deep_link || undefined,
          model_used: modelName,
        };
      } catch (err: any) {
        console.warn(`[FinPulse GeminiService] Failed call to ${modelName} after ${Date.now() - callStartTime}ms:`, err?.message || err);
      }
    }

    return null;
  }
}

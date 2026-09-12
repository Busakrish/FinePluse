import { config } from '../config/index.js';
import { db } from '../db/database.js';
import { BehavioralEngine } from '../engines/behavioral.js';
import { RecommendationEngine } from '../engines/recommendation.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { WhatIfEngine } from '../engines/whatif.js';
import { LifeEventPredictionService } from './lifeEventPrediction.service.js';

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
    'gemini-2.5-flash',
    'gemini-3.6-flash',
    'gemini-3.5-flash',
    'gemini-flash-latest',
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

    // Build verified bullet highlights
    const highlights: string[] = [];

    // Bullet 1: Balance status
    highlights.push(
      lang === 'gu'
        ? `તમારા ${snap.account.account_type === 'SALARY' ? 'પગાર' : 'બચત'} ખાતામાં ઉપલબ્ધ બેલેન્સ ₹${snap.account.balance.toLocaleString('en-IN')} છે.`
        : lang === 'hi'
        ? `आपके ${snap.account.account_type === 'SALARY' ? 'वेतन' : 'बचत'} खाते में वर्तमान शेष राशि ₹${snap.account.balance.toLocaleString('en-IN')} है।`
        : `Available balance in your ${snap.account.account_type} Account: ₹${snap.account.balance.toLocaleString('en-IN')}.`
    );

    // Bullet 2: Upcoming EMI or clean debt status
    if (snap.loans.count > 0) {
      const nearestLoan = snap.upcoming_events_timeline.find((e) => e.type === 'EMI');
      if (nearestLoan) {
        highlights.push(
          lang === 'gu'
            ? `આગામી EMI: ${nearestLoan.event_name} ₹${nearestLoan.amount.toLocaleString('en-IN')} (તારીખ ${nearestLoan.due_day}).`
            : lang === 'hi'
            ? `आगामी किश्त: ${nearestLoan.event_name} ₹${nearestLoan.amount.toLocaleString('en-IN')} (${nearestLoan.due_day} तारीख को देय).`
            : `Upcoming EMI: ${nearestLoan.event_name} of ₹${nearestLoan.amount.toLocaleString('en-IN')} due on day ${nearestLoan.due_day}.`
        );
      }
    } else {
      highlights.push(
        lang === 'gu'
          ? 'હાલમાં કોઈ સક્રિય લોન બાકી નથી. તમારું દેવું શૂન્ય છે!'
          : lang === 'hi'
          ? 'वर्तमान में कोई सक्रिय ऋण बकाया नहीं है। आपका ऋण स्तर शून्य है!'
          : 'Zero active debt obligations. All repayments current.'
      );
    }

    // Bullet 3: Savings growth trend
    const savingsDelta = snap.financial_twin.savings_growth_rate;
    if (savingsDelta > 0) {
      highlights.push(
        lang === 'gu'
          ? `આ મહિને તમારી બચતમાં +${savingsDelta}% નો વધારો થયો છે.`
          : lang === 'hi'
          ? `इस महीने आपकी बचत दर में +${savingsDelta}% की शानदार वृद्धि हुई है।`
          : `Monthly savings grew by +${savingsDelta}% compared to baseline.`
      );
    } else if (savingsDelta < 0) {
      highlights.push(
        lang === 'gu'
          ? `ધ્યાન આપો: બચતમાં ${savingsDelta}% નો ઘટાડો થયો છે.`
          : lang === 'hi'
          ? `सावधानी: बचत में ${savingsDelta}% की गिरावट दर्ज की गई है।`
          : `Alert: Monthly savings declined by ${savingsDelta}% recently.`
      );
    }

    // Bullet 4: Spending insight
    if (snap.spending_summary.highest_category.amount > 0) {
      highlights.push(
        lang === 'gu'
          ? `સૌથી મોટો ખર્ચ: ${snap.spending_summary.highest_category.category} (₹${snap.spending_summary.highest_category.amount.toLocaleString('en-IN')}).`
          : lang === 'hi'
          ? `सर्वाधिक व्यय: ${snap.spending_summary.highest_category.category} श्रेणी में ₹${snap.spending_summary.highest_category.amount.toLocaleString('en-IN')}.`
          : `Highest spending category: ${snap.spending_summary.highest_category.category} (₹${snap.spending_summary.highest_category.amount.toLocaleString('en-IN')}).`
      );
    }

    // Bullet 5: Financial Health score
    highlights.push(
      lang === 'gu'
        ? `નાણાકીય સ્વાસ્થ્ય સ્કોર: ${snap.financial_twin.health_score}/100 (${snap.financial_twin.health_tier}).`
        : lang === 'hi'
        ? `वित्तीय स्वास्थ्य स्कोर: ${snap.financial_twin.health_score}/100 (${snap.financial_twin.health_tier}).`
        : `Financial Health Score: ${snap.financial_twin.health_score}/100 (${snap.financial_twin.health_tier}).`
    );

    // Today's personalized suggestion
    let suggestion = '';
    let deepLink = '/twin';
    if (isStressed) {
      suggestion =
        lang === 'gu'
          ? 'સલાહ: તમારા પર EMI નું ભારણ વધુ છે. સમાધાન રાહત યોજના હેઠળ તમારો હપ્તો ₹13,200 સુધી ઓછો કરો.'
          : lang === 'hi'
          ? 'परामर्श: आपका ऋण भार अधिक है। समाधान योजना द्वारा अपनी किश्त ₹13,200 तक घटाएं।'
          : 'Advisory: High EMI commitment detected. Explore Samadhan Restructuring to reduce your EMI burden.';
      deepLink = '/stress-assistance';
    } else if (snap.financial_twin.monthly_surplus > 10000) {
      suggestion =
        lang === 'gu'
          ? `સલાહ: તમારા ખાતામાં ₹${snap.financial_twin.monthly_surplus.toLocaleString('en-IN')} ની સરપ્લસ બચત છે. ગોલ્ડ SIP અથવા ફિક્સ્ડ ડિપોઝિટ શરૂ કરો.`
          : lang === 'hi'
          ? `परामर्श: आपके पास ₹${snap.financial_twin.monthly_surplus.toLocaleString('en-IN')} का मासिक अधिशेष है। गोल्ड SIP या FD शुरू करें।`
          : `Tip: You have ₹${snap.financial_twin.monthly_surplus.toLocaleString('en-IN')} idle monthly surplus. An Emergency FD or Gold SIP would grow your wealth safely.`;
      deepLink = '/recommendations';
    } else {
      suggestion =
        lang === 'gu'
          ? 'સલાહ: નિયમિત ખર્ચ પર નિયંત્રણ રાખીને 3 મહિનાનું ઇમરજન્સી ફંડ તૈયાર કરો.'
          : lang === 'hi'
          ? 'परामर्श: अनावश्यक खर्चों को नियंत्रित कर 3 माह का आपातकालीन फंड बनाएं।'
          : 'Tip: Maintain essential vs discretionary discipline to build a 3-month emergency cushion.';
      deepLink = '/twin';
    }

    // Localized greeting
    const greeting =
      lang === 'gu'
        ? `નમસ્તે ${firstName}ભાઈ 👋`
        : lang === 'hi'
        ? `नमस्ते ${firstName} जी 👋`
        : `Good Day ${firstName} 👋`;

    const quickActions =
      lang === 'gu'
        ? ['મારું ખાતા બેલેન્સ', 'આગામી EMI તારીખ', 'ખર્ચ રિપોર્ટ']
        : lang === 'hi'
        ? ['मेरा बैलेंस बताओ', 'आगामी किश्त कब है?', 'साप्ताहिक खर्च विवरण']
        : ['Check Available Balance', 'Upcoming Financial Events', 'Weekly Spending Summary'];

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
3. Language Handling:
   - Detect the language of the user's message (English, Hindi, or Gujarati).
   - If user speaks Hinglish (e.g. "Mera balance kitna hai"), respond in friendly conversational Hinglish or clean Hindi.
   - If user speaks Gujlish or Gujarati (e.g. "Maru balance ketlu che", "Mare loan joi che"), respond in warm Gujarati.
   - If user speaks English, respond in English.
   - Maintain the user's selected/preferred language throughout the dialogue.

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

12. Out of Scope / Fallback:
    - If the request is totally unrelated to banking (e.g. general trivia, poetry): Politely say: "I'm FinPulse AI, your dedicated banking assistant for Bharat. I can assist you with your accounts, loans, UPI payments, fraud protection, investments, and financial health." Do not answer general trivia.

13. Response Format:
    Output ONLY a valid JSON object with NO surrounding markdown backticks (no \`\`\`json):
    {
      "message": "Friendly, empathetic, conversational response with clear markdown formatting (bold key numbers in Indian currency format like ₹1,42,500).",
      "language": "en" | "hi" | "gu",
      "intent": "CHECK_BALANCE" | "CHECK_LOANS_EMI" | "CHECK_TRANSACTIONS" | "FINANCIAL_HEALTH" | "FINANCIAL_ADVICE" | "INVESTMENT_GUIDANCE" | "INSURANCE_GUIDANCE" | "FRAUD_SECURITY" | "UPI_HELP" | "STRESS_ASSISTANCE" | "CONSENT_QUERY" | "WHAT_IF_LOAN" | "WEEKLY_SPENDING_SUMMARY" | "UPCOMING_EVENTS" | "FINANCIAL_COACH" | "OPPORTUNITY_DETECTOR" | "LIFE_EVENT_PREDICTION" | "GENERAL_BANKING" | "OUT_OF_SCOPE",
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
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
        const bodyPayload = {
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.3,
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
        });

        if (!res.ok) {
          const errText = await res.text();
          if (res.status === 404 || errText.includes('NOT_FOUND') || errText.includes('not available')) {
            continue;
          }
          console.warn(`[FinPulse GeminiService] Model ${modelName} returned status ${res.status}`);
          continue;
        }

        const data = (await res.json()) as any;
        const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!candidateText) {
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
        console.warn(`[FinPulse GeminiService] Failed call to ${modelName}:`, err?.message || err);
      }
    }

    return null;
  }
}

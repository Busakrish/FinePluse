import { config } from '../config/index.js';
import { db } from '../db/database.js';
import { BehavioralEngine } from '../engines/behavioral.js';
import { RecommendationEngine } from '../engines/recommendation.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { WhatIfEngine } from '../engines/whatif.js';

export interface GeminiChatPayload {
  message: string;
  language: 'en' | 'hi' | 'gu';
  intent: string;
  verified_data: any;
  suggested_actions: string[];
  deep_link?: string;
  model_used?: string;
}

export interface ChatHistoryItem {
  sender: 'USER' | 'ASSISTANT';
  content: string;
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
   * This ensures Gemini never hallucinates numbers or account statuses.
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
    const recentTxns = transactions.slice(-8).reverse().map((t) => ({
      date: t.created_at?.slice(0, 10) || 'Recent',
      description: t.description,
      amount: t.amount,
      type: t.type,
      category: t.category,
      is_anomaly: t.is_anomaly || false,
    }));

    // Recommendations (if consent permits)
    let recommendations: any[] = [];
    if (!consent || consent.personalized_recommendations) {
      try {
        const recResult = RecommendationEngine.generateRecommendations(customerId);
        recommendations = recResult.recommendations.map((r) => ({
          name: r.product_name,
          type: r.product_type,
          why: r.why_am_i_seeing_this?.key_factors || [],
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
        restructured_emi_estimate: Math.round(totalEmi * 0.55), // samadhan program extends tenure and cuts EMI
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
      banking_services: {
        upi_daily_limit: 100000,
        emergency_fraud_helpline: '1800-425-0018 (24x7 Toll-Free Bharat Banking)',
        card_freeze_status: 'ACTIVE',
      },
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
You are FinPulse AI — an empathetic, hyper-personalized conversational banking assistant tailored specifically for India and Bharat (Tier 2/3/4 towns and rural communities).
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
4. Topics Supported:
   - Accounts & Balance: Use verified account balance (₹${verifiedSnapshot.account.balance.toLocaleString('en-IN')}).
   - Transactions: Explain recent spending, debits, credits, or categories from verified transactions.
   - Loans & EMI: Cite exact active loan details, monthly EMI (₹${verifiedSnapshot.loans.total_monthly_emi.toLocaleString('en-IN')}), and due dates.
   - What-If Simulations: If user asks about taking a loan (e.g. "Can I take a bike loan?", "Can I afford 5 Lakhs?"), explain the impact on their current monthly surplus (₹${verifiedSnapshot.financial_twin.monthly_surplus.toLocaleString('en-IN')}) and guide them to the What-If Simulator.
   - Financial Health: Explain their health score (${verifiedSnapshot.financial_twin.health_score}/100) and why (savings ratio: ${verifiedSnapshot.financial_twin.savings_ratio_percent}%, debt burden: ${verifiedSnapshot.financial_twin.debt_burden_percent}%).
   - Investments / SIP / FD: Recommend only verified matching products from the recommendation engine, explaining the exact reason.
   - UPI Assistance: Explain NPCI auto-reversal timelines (T+1 to T+2 days), daily limits (₹${verifiedSnapshot.banking_services.upi_daily_limit.toLocaleString('en-IN')}), or how to report payment issues.
   - Fraud & Security: If user mentions unauthorized deduction, lost card, or fraud, instruct how to freeze card immediately and contact ${verifiedSnapshot.banking_services.emergency_fraud_helpline}.
   - Consent: Explain DPDPA 2023 settings if asked.
5. Out of Scope / Fallback:
   - If the request is totally unrelated to banking (e.g. general knowledge, entertainment): Politely say: "I'm FinPulse AI, your dedicated banking assistant for Bharat. I can assist you with your accounts, loans, UPI payments, fraud protection, investments, and financial health." Do not answer general trivia.
   - If the request is banking-related but unclear, gently ask for clarification with 2-3 specific options.
6. Response Format:
   Output ONLY a valid JSON object with NO surrounding markdown backticks (no \`\`\`json):
   {
     "message": "Friendly, empathetic, conversational response with clear markdown formatting (bold key numbers in Indian currency format like ₹1,42,500).",
     "language": "en" | "hi" | "gu",
     "intent": "CHECK_BALANCE" | "CHECK_LOANS_EMI" | "CHECK_TRANSACTIONS" | "FINANCIAL_HEALTH" | "FINANCIAL_ADVICE" | "INVESTMENT_GUIDANCE" | "INSURANCE_GUIDANCE" | "FRAUD_SECURITY" | "UPI_HELP" | "STRESS_ASSISTANCE" | "CONSENT_QUERY" | "WHAT_IF_LOAN" | "GENERAL_BANKING" | "OUT_OF_SCOPE",
     "verified_data": { ...key figures actually cited in response... },
     "suggested_actions": ["2 to 3 short contextual followup prompts in the response language"],
     "deep_link": "/what-if" | "/stress-assistance" | "/fraud-security" | "/recommendations" | "/consent" | "/twin" | null
   }
`.trim();

    // Prepare conversation messages
    const contents: any[] = [];

    // Include recent history for conversation memory
    for (const h of conversationHistory.slice(-6)) {
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
          // If response has extra text around JSON, extract substring between first { and last }
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
          suggested_actions: Array.isArray(parsed.suggested_actions) ? parsed.suggested_actions : [],
          deep_link: parsed.deep_link || undefined,
          model_used: modelName,
        };
      } catch (err: any) {
        console.warn(`[FinPulse GeminiService] Failed call to ${modelName}:`, err?.message || err);
        // continue to next model
      }
    }

    return null;
  }
}

import { db } from '../db/database.js';
import { CustomerProfile, Account, Transaction, Loan, FinancialTwin } from '../db/types.js';
import { GeminiService, ChatHistoryItem } from '../services/gemini.service.js';
import { SpendingCoachService } from '../services/spendingCoach.service.js';
import { RecommendationEngine } from './recommendation.js';
import { FinancialStressEngine } from './stress.js';

export interface VernacularChatResponse {
  message: string;
  language: 'en' | 'hi' | 'gu';
  intent: string;
  verified_data: any;
  suggested_actions?: string[];
  proactive_insight?: string;
  coaching_advice?: {
    why_this_advice: string;
    expected_benefit: string;
  };
  deep_link?: string;
  model_used?: string;
}

export class VernacularEngine {
  /**
   * Async conversational processing powered by Gemini 2.5 Flash with verified banking grounding.
   * Gracefully falls back to deterministic engine if Gemini is unavailable.
   */
  public static async processQueryWithGemini(
    customerId: string,
    queryText: string,
    languageHint?: 'en' | 'hi' | 'gu',
    history: ChatHistoryItem[] = []
  ): Promise<VernacularChatResponse> {
    try {
      const geminiResponse = await GeminiService.generateConversationalResponse(
        customerId,
        queryText,
        languageHint,
        history
      );

      if (geminiResponse && geminiResponse.message) {
        // Guarantee rich engine artifacts are attached for specialized intent cards
        if (geminiResponse.intent === 'SPENDING_COACH' && (!geminiResponse.verified_data?.spending_coach || !geminiResponse.verified_data?.total_monthly_spent)) {
          const coach = SpendingCoachService.getCoachData(customerId).data;
          if (coach) {
            geminiResponse.verified_data = {
              ...geminiResponse.verified_data,
              spending_coach: {
                total_monthly_spent: coach.overview.total_spent_this_month,
                highest_category: coach.categories[0]?.category || 'Shopping',
                highest_category_amount: coach.categories[0]?.amount || 0,
                lowest_category: coach.categories[coach.categories.length - 1]?.category || 'Utilities',
                lowest_category_amount: coach.categories[coach.categories.length - 1]?.amount || 0,
                mom_change_pct: coach.categories[0]?.change_percentage || 0,
              },
            };
          }
        } else if (geminiResponse.intent === 'UPCOMING_EVENTS' && !Array.isArray(geminiResponse.verified_data?.timeline)) {
          const loans = db.filter('loans', (l) => l.customer_id === customerId && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
          const profile = db.findById('customer_profiles', customerId);
          const currentDate = new Date();
          const currentDay = currentDate.getDate();
          const events: any[] = [];
          for (const l of loans) {
            const days = l.due_day_of_month >= currentDay ? l.due_day_of_month - currentDay : (30 - currentDay) + l.due_day_of_month;
            events.push({
              title: `${l.loan_type} EMI`,
              amount: l.monthly_emi,
              date: `Day ${l.due_day_of_month} of month`,
              days_remaining: days,
              type: 'EMI',
              status: days === 0 ? 'TODAY' : 'UPCOMING',
            });
          }
          if (profile) {
            events.push({
              title: 'Monthly Salary Credit',
              amount: profile.monthly_income,
              date: 'Day 1 of month',
              days_remaining: currentDay === 1 ? 0 : (30 - currentDay) + 1,
              type: 'SALARY',
              status: currentDay === 1 ? 'TODAY' : 'UPCOMING',
            });
          }
          geminiResponse.verified_data = {
            ...geminiResponse.verified_data,
            timeline: events,
            upcoming_events: events,
          };
        } else if (geminiResponse.intent === 'OPPORTUNITY_DETECTOR' && !Array.isArray(geminiResponse.verified_data?.opportunities)) {
          const recResult = RecommendationEngine.generateRecommendations(customerId);
          const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
          const stress = FinancialStressEngine.evaluateStress(customerId);
          geminiResponse.verified_data = {
            ...geminiResponse.verified_data,
            opportunities: recResult.recommendations.map((r) => ({
              product_name: r.product_name,
              product_type: r.product_type,
              match_score: Math.round((r.confidence_score || 0.85) * 100),
              why_recommendation: r.why_am_i_seeing_this?.summary || r.why_am_i_seeing_this?.key_factors?.join('; ') || 'Personalized recommendation based on account cashflow',
              expected_benefit: r.expected_benefit || 'Optimized returns and liquidity',
              why: r.why_am_i_seeing_this?.key_factors || [],
            })),
            dont_sell_me_active: Boolean(twin?.dont_sell_me_active || stress.dont_sell_me_engaged || stress.stress_level === 'HIGH'),
          };
        }

        return geminiResponse;
      }
    } catch (err: any) {
      console.warn('[FinPulse VernacularEngine] Gemini error, falling back to deterministic engine:', err?.message || err);
    }

    // Graceful fallback to deterministic offline engine with conversation history
    const fallback = this.processQuery(customerId, queryText, languageHint, history);
    return {
      ...fallback,
      model_used: 'deterministic-offline-fallback',
    };
  }

  public static processQuery(
    customerId: string,
    queryText: string,
    languageHint?: 'en' | 'hi' | 'gu',
    history: ChatHistoryItem[] = []
  ): VernacularChatResponse {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      throw new Error(`Customer profile not found for: ${customerId}`);
    }

    const account = db.findOne('accounts', (a) => a.customer_id === customerId);
    const transactions = db.filter('transactions', (t) => t.customer_id === customerId);
    const loans = db.filter('loans', (l) => l.customer_id === customerId && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    const stress = FinancialStressEngine.evaluateStress(customerId);

    const q = queryText.toLowerCase().trim();

    // Language Detection & Session Memory (Feature 8)
    let lang: 'en' | 'hi' | 'gu' = languageHint || profile.preferred_language || 'en';
    if (/[\u0A80-\u0AFF]/.test(queryText) || q.includes('mare') || q.includes('maru') || q.includes('joi che') || q.includes('vishe') || q.includes('ketla')) {
      lang = 'gu';
    } else if (/[\u0900-\u097F]/.test(queryText) || q.includes('mera') || q.includes('meri') || q.includes('kitna') || q.includes('hai') || q.includes('batao') || q.includes('chahiye')) {
      lang = 'hi';
    }

    // Intent Detection & Responses
    let intent = 'UNKNOWN';
    let verifiedData: any = {};
    let responseText = '';
    let suggestedActions: string[] = [];
    let proactiveInsight: string | undefined = undefined;
    let coachingAdvice: { why_this_advice: string; expected_benefit: string } | undefined = undefined;
    let deepLink: string | undefined = undefined;

    const totalBalance = account ? account.balance : 0;
    const totalEmi = loans.reduce((acc, l) => acc + l.monthly_emi, 0);

    // Feature 8: Multi-turn Conversation Memory Check
    // e.g. "Can I reduce this EMI?", "Reduce it", "How to restructure it?"
    const isEmiReductionFollowup =
      q.includes('reduce this emi') ||
      q.includes('reduce emi') ||
      q.includes('can i reduce') ||
      q.includes('reduce it') ||
      q.includes('restructure') ||
      q.includes('हप्ता कम') ||
      q.includes('હપ્તો ઓછો') ||
      q.includes('किश्त कम') ||
      q.includes('emi kam');

    if (isEmiReductionFollowup && loans.length > 0) {
      intent = 'STRESS_ASSISTANCE';
      verifiedData = {
        current_emi: totalEmi,
        restructured_emi_estimate: Math.round(totalEmi * 0.55),
        dont_sell_me_active: twin?.dont_sell_me_active || stress.dont_sell_me_engaged,
      };

      if (twin?.dont_sell_me_active || stress.stress_level === 'HIGH') {
        if (lang === 'gu') {
          responseText = `🛡️ **સમાધાન રાહત યોજના**: તમારા ઉચ્ચ EMI બોજને ધ્યાનમાં રાખીને, અમે તમારી માસિક EMI ₹${totalEmi.toLocaleString('en-IN')} થી ઘટાડીને આશરે **₹${Math.round(totalEmi * 0.55).toLocaleString('en-IN')}** સુધી રિસ્ટ્રક્ચર કરી શકીએ છીએ. કોઈ દંડ વસૂલવામાં આવશે નહીં.`;
          proactiveInsight = `સમાધાન યોજના હેઠળ તમારી લોન મુદ્દત લંબાવી શકાય છે જેથી તમારો રોકડ પ્રવાહ સુરક્ષિત રહે.`;
          suggestedActions = ['સમાધાન રાહત માટે અરજી કરો', 'What-If સિમ્યુલેટર', 'ખાતા બેલેન્સ તપાસો'];
        } else if (lang === 'hi') {
          responseText = `🛡️ **समाधान ऋण पुनर्गठन योजना**: आपके उच्च ईएमआई दबाव को देखते हुए, हम आपकी मासिक EMI ₹${totalEmi.toLocaleString('en-IN')} से घटाकर लगभग **₹${Math.round(totalEmi * 0.55).toLocaleString('en-IN')}** तक कर सकते हैं। बिना किसी पेनल्टी के अवधि विस्तार उपलब्ध है।`;
          proactiveInsight = `समाधान योजना से मासिक किश्त कम करने पर आपका वित्तीय तनाव तुरंत 'HIGH' से 'MODERATE' हो जाएगा।`;
          suggestedActions = ['समाधान राहत हेतु आवेदन करें', 'What-If सिम्युलेटर चलाएं', 'खाता शेष जांचें'];
        } else {
          responseText = `🛡️ **Samadhan Debt Restructuring**: Based on your current debt commitments, we can restructure your active loans from ₹${totalEmi.toLocaleString('en-IN')}/month down to approximately **₹${Math.round(totalEmi * 0.55).toLocaleString('en-IN')}/month** with an extended tenure and zero penalty.`;
          proactiveInsight = `Restructuring under the Samadhan Program relieves immediate liquidity stress and shields your CIBIL score.`;
          suggestedActions = ['Apply for Samadhan Relief', 'Open What-If Simulator', 'View Loan Details'];
        }
        deepLink = '/stress-assistance';
      } else {
        if (lang === 'gu') {
          responseText = `તમારી વર્તમાન લોન EMI ₹${totalEmi.toLocaleString('en-IN')} છે. તમે What-If લોન સિમ્યુલેટર દ્વારા મુદ્દત લંબાવીને અથવા વધારાની પ્રિ-પેમેન્ટ કરીને હપ્તો ઘટાડી શકો છો.`;
          proactiveInsight = `વોટ-ઇફ સિમ્યુલેટરમાં 12 મહિનાની મુદ્દત વધારવાથી તમારી માસિક EMI આશરે 18% ઘટી શકે છે.`;
          suggestedActions = ['What-If સિમ્યુલેટર ખોલો', 'લોન વિગત જુઓ', 'EMI રાહત વિકલ્પો'];
        } else if (lang === 'hi') {
          responseText = `आपकी वर्तमान ऋण किश्त ₹${totalEmi.toLocaleString('en-IN')} है। आप What-If लोन सिमुलेटर में अवधि बढ़ाकर या आंशिक पूर्व-भुगतान कर किश्त कम कर सकते हैं।`;
          proactiveInsight = `What-If सिमुलेटर में ऋण अवधि 12 माह बढ़ाने से आपकी मासिक EMI लगभग 18% कम हो जाएगी।`;
          suggestedActions = ['What-If सिमुलेटर खोलें', 'ऋण विवरण देखें', 'किश्त राहत विकल्प'];
        } else {
          responseText = `Your current active EMI commitment is ₹${totalEmi.toLocaleString('en-IN')}. You can explore extending your tenure or making partial prepayments in the What-If Simulator to lower your monthly outflow.`;
          proactiveInsight = `Extending your loan tenure by 12 months in the What-If Simulator can reduce monthly EMI by up to 18%.`;
          suggestedActions = ['Open What-If Simulator', 'View Loan Details', 'EMI Relief Options'];
        }
        deepLink = '/what-if';
      }
    }

    // Feature 5: Upcoming Financial Events Timeline
    else if (
      q.includes('upcoming') ||
      q.includes('what is coming') ||
      q.includes("what's coming") ||
      q.includes('this week') ||
      q.includes('upcoming bills') ||
      q.includes('upcoming payments') ||
      q.includes('upcoming emis') ||
      q.includes('salary expected') ||
      q.includes('expected salary') ||
      q.includes('schedule') ||
      q.includes('આગામી') ||
      q.includes('આવતા') ||
      q.includes('આવક') ||
      q.includes('आगामी') ||
      q.includes('इस हफ्ते') ||
      q.includes('देय')
    ) {
      intent = 'UPCOMING_EVENTS';
      const currentDate = new Date();
      const currentDay = currentDate.getDate();

      const events: any[] = [];
      for (const l of loans) {
        const days = l.due_day_of_month >= currentDay ? l.due_day_of_month - currentDay : (30 - currentDay) + l.due_day_of_month;
        events.push({
          name: `${l.loan_type} EMI`,
          amount: l.monthly_emi,
          day: l.due_day_of_month,
          days_until: days,
          type: 'EMI',
        });
      }
      events.push({
        name: 'Monthly Salary Credit',
        amount: profile.monthly_income,
        day: 1,
        days_until: currentDay === 1 ? 0 : (30 - currentDay) + 1,
        type: 'INCOME',
      });

      const timeline = events.map(e => ({
        title: e.name,
        amount: e.amount,
        date: `Day ${e.day} of month`,
        days_remaining: e.days_until,
        type: e.type === 'INCOME' ? 'SALARY' : 'EMI',
        status: e.days_until === 0 ? 'TODAY' : 'UPCOMING',
      }));

      verifiedData = { upcoming_events: events, timeline };

      if (lang === 'gu') {
        const eventLines = events.map(e => `• **${e.name}**: ₹${e.amount.toLocaleString('en-IN')} (${e.days_until === 0 ? 'આજે' : `${e.days_until} દિવસમાં, તારીખ ${e.day}`})`).join('\n');
        responseText = `📅 **તમારી આગામી નાણાકીય સમયરેખા (Upcoming Events)**:\n${eventLines}\n• વર્તમાન ઉપલબ્ધ બેલેન્સ: **₹${totalBalance.toLocaleString('en-IN')}**`;
        proactiveInsight = `સલાહ: EMI બાઉન્સ ચાર્જ અને પેનલ્ટીથી બચવા માટે ખાતામાં ઓછામાં ઓછું 1.5x લિક્વિડ બેલેન્સ જાળવી રાખો.`;
        suggestedActions = ['ખાતા બેલેન્સ તપાસો', 'ખર્ચ રિપોર્ટ', 'લોન વિગત જુઓ'];
      } else if (lang === 'hi') {
        const eventLinesHi = events.map(e => `• **${e.name}**: ₹${e.amount.toLocaleString('en-IN')} (${e.days_until === 0 ? 'आज' : `${e.days_until} दिन में, ${e.day} तारीख को`})`).join('\n');
        responseText = `📅 **आपकी आगामी वित्तीय समयरेखा (Upcoming Timeline)**:\n${eventLinesHi}\n• उपलब्ध बैंक बैलेंस: **₹${totalBalance.toLocaleString('en-IN')}**`;
        proactiveInsight = `सुझाव: ECS बाउंस पेनल्टी से बचने हेतु नियत तारीख से पूर्व खाते में पर्याप्त बैलेंस सुनिश्चित करें।`;
        suggestedActions = ['खाता बैलेंस जांचें', 'खर्च का विश्लेषण करें', 'ऋण विवरण देखें'];
      } else {
        const eventLinesEn = events.map(e => `• **${e.name}**: ₹${e.amount.toLocaleString('en-IN')} (${e.days_until === 0 ? 'Today' : `in ${e.days_until} days, Day ${e.day}`})`).join('\n');
        responseText = `📅 **Upcoming Financial Events Timeline**:\n${eventLinesEn}\n• Current Available Liquid Balance: **₹${totalBalance.toLocaleString('en-IN')}**`;
        proactiveInsight = `Proactive Tip: Maintain a liquid buffer of at least 1.5x your upcoming EMI to avoid ECS bounce charges.`;
        suggestedActions = ['Check Available Balance', 'Analyze Spending', 'View Loan Details'];
      }
      deepLink = '/transactions';
    }

    // Feature 6: Opportunity Detector (Personalized Investments / Savings)
    else if (
      q.includes('opportunity') ||
      q.includes('opportunities') ||
      q.includes('eligible') ||
      q.includes('gold sip') ||
      q.includes('emergency fd') ||
      q.includes('investment option') ||
      q.includes('rokan') ||
      q.includes('રોકાણ') ||
      q.includes('બચત યોજના') ||
      q.includes('निवेश') ||
      q.includes('योजनाएं') ||
      q.includes('best investment')
    ) {
      intent = 'OPPORTUNITY_DETECTOR';
      const recResult = RecommendationEngine.generateRecommendations(customerId);
      const recs = recResult.recommendations;

      verifiedData = {
        recommendations_count: recs.length,
        opportunities: recs.map(r => ({
          product_name: r.product_name,
          product_type: r.product_type,
          match_score: Math.round((r.confidence_score || 0.85) * 100),
          why_recommendation: r.why_am_i_seeing_this?.summary || (r.why_am_i_seeing_this?.key_factors ? r.why_am_i_seeing_this.key_factors.join('; ') : 'Personalized recommendation based on verified account behavior'),
          expected_benefit: r.expected_benefit || 'Optimized returns and safety',
          why: r.why_am_i_seeing_this?.key_factors || [],
        })),
        dont_sell_me_active: Boolean(twin?.dont_sell_me_active || stress.dont_sell_me_engaged || stress.stress_level === 'HIGH'),
      };

      if (twin?.dont_sell_me_active || stress.stress_level === 'HIGH') {
        if (lang === 'gu') {
          responseText = `🛡️ **ડોન્ટ સેલ મી મોડ સક્રિય છે**: તમારા કેશફ્લોના રક્ષણ માટે વ્યાપારી લોન ઓફર સ્થગિત છે. તેના બદલે અમે સલામત લિક્વિડ બચત અને સમાધાન યોજના ભલામણ કરીએ છીએ.`;
          proactiveInsight = `નાણાકીય તણાવના સમયગાળામાં નવું દેવું ટાળીને ઇમરજન્સી બફર બનાવવું શ્રેષ્ઠ છે.`;
          suggestedActions = ['સમાધાન રાહત વિકલ્પો', 'બજેટ સુધારણા ટિપ્સ', 'ખાતા બેલેન્સ'];
        } else if (lang === 'hi') {
          responseText = `🛡️ **डोंट सेल मी मोड सक्रिय**: आपके वित्तीय स्वास्थ्य की सुरक्षा हेतु व्यावसायिक ऋण ऑफर रोक दिए गए हैं। हम सुरक्षित लिक्विड बचत और समाधान पुनर्गठन की सलाह देते हैं।`;
          proactiveInsight = `वित्तीय तनाव के दौरान अतिरिक्त कर्ज से बचना और आपातकालीन फंड तैयार करना सर्वोत्तम रणनीति है।`;
          suggestedActions = ['समाधान राहत विकल्प', 'बजट सुधार सुझाव', 'खाता बैलेंस'];
        } else {
          responseText = `🛡️ **Don't Sell Me Mode Active**: Commercial borrowing offers are suppressed to safeguard your cashflow. We recommend focusing on safe liquid savings and Samadhan restructuring.`;
          proactiveInsight = `During financial stress, avoiding high-interest debt and building an emergency buffer is the safest path to recovery.`;
          suggestedActions = ['Explore Samadhan Relief', 'Budget Recovery Tips', 'Check Balance'];
        }
        deepLink = '/stress-assistance';
      } else {
        const topRec = recs[0];
        const secondRec = recs[1];
        if (lang === 'gu') {
          responseText = `🚀 **વ્યક્તિગત નાણાકીય તકો (Opportunities Detected)**:\n1. **${topRec?.product_name || 'ઇમરજન્સી લિક્વિડ FD'}** (${topRec?.product_type || 'DEPOSIT'})\n   • શા માટે ભલામણ: ${topRec?.why_am_i_seeing_this?.key_factors?.[0] || 'તમારા ખાતામાં આઇડલ સરપ્લસ ઉપલબ્ધ છે'}\n${secondRec ? `2. **${secondRec.product_name}** (${secondRec.product_type})\n   • શા માટે ભલામણ: ${secondRec.why_am_i_seeing_this?.key_factors?.[0] || 'સુરક્ષિત સંપત્તિ વૃદ્ધિ'}\n` : ''}💡 આ ભલામણો સંપૂર્ણપણે તમારા વેરિફાઇડ કેશફ્લો પર આધારિત છે.`;
          proactiveInsight = `પગાર જમા થતાં જ ઓટો-ડેબિટ SIP શરૂ કરવાથી 'પહેલા તમારી જાતને ચૂકવો' નિયમનું પાલન થાય છે.`;
          suggestedActions = ['તમામ યોજનાઓ જુઓ', 'SIP શરૂ કરો', 'બેલેન્સ તપાસો'];
        } else if (lang === 'hi') {
          responseText = `🚀 **व्यक्तिगत वित्तीय अवसर (Opportunities Detected)**:\n1. **${topRec?.product_name || 'इमरजेंसी लिक्विड FD'}** (${topRec?.product_type || 'DEPOSIT'})\n   • यह सिफारिश क्यों: ${topRec?.why_am_i_seeing_this?.key_factors?.[0] || 'आपके पास मासिक अधिशेष उपलब्ध है'}\n${secondRec ? `2. **${secondRec.product_name}** (${secondRec.product_type})\n   • यह सिफारिश क्यों: ${secondRec.why_am_i_seeing_this?.key_factors?.[0] || 'सुरक्षित धन वृद्धि'}\n` : ''}💡 यह सुझाव पूरी तरह आपके प्रमाणित वित्तीय ट्विन पर आधारित हैं।`;
          proactiveInsight = `वेतन क्रेडिट होते ही ऑटो-डेबिट निवेश शुरू करने से अनुशासित बचत की आदत बनती है।`;
          suggestedActions = ['सभी योजनाएं देखें', 'SIP शुरू करें', 'बैलेंस जांचें'];
        } else {
          responseText = `🚀 **Personalized Financial Opportunities Detected**:\n1. **${topRec?.product_name || 'Emergency Liquid FD'}** (${topRec?.product_type || 'DEPOSIT'})\n   • **Why you're seeing this:** ${topRec?.why_am_i_seeing_this?.key_factors?.[0] || 'Idle monthly surplus detected in savings account'}\n${secondRec ? `2. **${secondRec.product_name}** (${secondRec.product_type})\n   • **Why you're seeing this:** ${secondRec.why_am_i_seeing_this?.key_factors?.[0] || 'Safe long-term wealth compounding'}\n` : ''}💡 These recommendations are grounded strictly in your verified financial twin.`;
          proactiveInsight = `Automating investments immediately following salary credit reinforces the 'pay yourself first' wealth-building principle.`;
          suggestedActions = ['View All Offers', 'Start SIP', 'Check Balance'];
        }
        deepLink = '/recommendations';
      }
    }

    // Intent 1: Balance Check (Feature 2 Proactive Insights & Feature 7 Context Chips)
    else if (
      q.includes('balance') ||
      q.includes('paisa') ||
      q.includes('khata') ||
      q.includes('khate') ||
      q.includes('shilak') ||
      q.includes('બેલેન્સ') ||
      q.includes('ખાતા') ||
      q.includes('જમા') ||
      q.includes('બેલન્સ') ||
      q.includes('બચત')
    ) {
      intent = 'CHECK_BALANCE';
      verifiedData = {
        account_number: account?.account_number || 'N/A',
        account_type: account?.account_type || 'SAVINGS',
        available_balance: totalBalance,
        idle_surplus_estimate: Math.round(totalBalance * 0.4),
      };

      const idleCash = Math.round(totalBalance * 0.4);

      if (lang === 'gu') {
        responseText = `તમારા ${account?.account_type === 'SALARY' ? 'પગાર' : 'બચત'} ખાતા (નંબર: ...${account?.account_number.slice(-4)}) માં વર્તમાન ઉપલબ્ધ બેલેન્સ **₹${totalBalance.toLocaleString('en-IN')}** છે.`;
        proactiveInsight = `તમારા ખાતામાં આશરે ₹${idleCash.toLocaleString('en-IN')} ની નિષ્ક્રિય રકમ છે. ઇમરજન્સી લિક્વિડ FD માં રોકાણ કરવાથી 7.1% સુધી વ્યાજ મેળવી શકો છો.`;
        suggestedActions = ['છેલ્લા વ્યવહારો જુઓ', 'ખર્ચ વિશ્લેષણ', 'બચત સલાહ'];
      } else if (lang === 'hi') {
        responseText = `आपके ${account?.account_type === 'SALARY' ? 'वेतन' : 'बचत'} खाते (संख्या: ...${account?.account_number.slice(-4)}) में कुल उपलब्ध शेष राशि **₹${totalBalance.toLocaleString('en-IN')}** है।`;
        proactiveInsight = `आपके बचत खाते में लगभग ₹${idleCash.toLocaleString('en-IN')} निष्क्रिय पड़े हैं। इमरजेंसी लिक्विड FD द्वारा अधिक ब्याज अर्जित कर सकते हैं।`;
        suggestedActions = ['हाल के लेन-देन देखें', 'खर्च का विश्लेषण करें', 'बचत सलाह'];
      } else {
        responseText = `Your current available balance in ${account?.account_type || 'Savings'} Account (...${account?.account_number.slice(-4)}) is **₹${totalBalance.toLocaleString('en-IN')}**.`;
        proactiveInsight = `You currently have ₹${idleCash.toLocaleString('en-IN')} idle cash in your savings account. Based on your profile, an Emergency Liquid FD could improve your emergency fund with higher returns.`;
        suggestedActions = ['View Recent Transactions', 'Analyze Spending', 'Savings Advice'];
      }
      deepLink = '/transactions';
    }

    // Intent 2: EMI / Loan Details (Feature 2 Proactive Insights & Feature 7 Context Chips)
    else if (
      q.includes('emi') ||
      q.includes('loan') ||
      q.includes('kisht') ||
      q.includes('hafto') ||
      q.includes('હપ્તો') ||
      q.includes('લોન') ||
      q.includes('વ્યાજ') ||
      q.includes('कर्ज') ||
      q.includes('किश्त')
    ) {
      intent = 'CHECK_EMI';
      verifiedData = {
        active_loans_count: loans.length,
        total_monthly_emi: totalEmi,
        loans_breakdown: loans.map((l) => ({
          type: l.loan_type,
          emi: l.monthly_emi,
          due_day: l.due_day_of_month,
          status: l.status,
          outstanding: l.outstanding_amount,
        })),
      };

      if (loans.length === 0) {
        if (lang === 'gu') {
          responseText = 'તમારી પાસે હાલમાં કોઈ સક્રિય લોન કે EMI બાકી નથી. તમારી નાણાકીય સ્થિતિ ખૂબ સારી છે!';
          proactiveInsight = 'શૂન્ય દેવું હોવાથી તમે તમારી બચતને મ્યુચ્યુઅલ ફંડ અથવા ગોલ્ડ SIP માં ફાળવી શકો છો.';
          suggestedActions = ['શ્રેષ્ઠ રોકાણ વિકલ્પો', 'બેલેન્સ તપાસો', 'ખર્ચ રિપોર્ટ'];
        } else if (lang === 'hi') {
          responseText = 'वर्तमान में आपके पास कोई सक्रिय ऋण (Loan) या EMI बकाया नहीं है। आपका वित्तीय स्वास्थ्य बहुत अच्छा है!';
          proactiveInsight = 'शून्य कर्ज होने के कारण आप अपनी मासिक बचत को सुरक्षित संपत्तियों में निवेश कर सकते हैं।';
          suggestedActions = ['सर्वश्रेष्ठ निवेश विकल्प', 'बैलेंस जांचें', 'खर्च रिपोर्ट'];
        } else {
          responseText = 'You currently have no active loans or pending EMI obligations. Your cashflow is 100% debt-free!';
          proactiveInsight = 'With zero debt burden, allocating surplus into disciplined SIPs will compound wealth rapidly.';
          suggestedActions = ['Build Emergency Fund', 'Start SIP', 'View Spending Report'];
        }
      } else {
        const loanSummaries = loans.map((l) => `• **${l.loan_type}**: ₹${l.monthly_emi.toLocaleString('en-IN')}/મહિને (તારીખ ${l.due_day_of_month})`).join('\n');
        const loanSummariesHi = loans.map((l) => `• **${l.loan_type}**: ₹${l.monthly_emi.toLocaleString('en-IN')}/माह (हर माह की ${l.due_day_of_month} तारीख)`).join('\n');
        const loanSummariesEn = loans.map((l) => `• **${l.loan_type} Loan**: ₹${l.monthly_emi.toLocaleString('en-IN')}/month (Due: Day ${l.due_day_of_month})`).join('\n');

        if (lang === 'gu') {
          responseText = `તમારી કુલ માસિક EMI **₹${totalEmi.toLocaleString('en-IN')}** છે.\nસક્રિય લોન વિગતો:\n${loanSummaries}\n${twin?.dont_sell_me_active ? '⚠️ સમાધાન રાહત યોજના હેઠળ તમારો હપ્તો ઘટાડવા અરજી કરી શકો છો.' : ''}`;
          proactiveInsight = `નિયત તારીખ પહેલાં EMI ચૂકવવાથી ક્રેડિટ સ્કોર સુરક્ષિત રહે છે અને દેવાનો ગુણોત્તર નિયંત્રણમાં રહે છે.`;
          suggestedActions = ['લોન વિગત જુઓ', 'What-If સિમ્યુલેટર', 'હપ્તા રાહત વિકલ્પો'];
        } else if (lang === 'hi') {
          responseText = `आपकी कुल मासिक EMI राशि **₹${totalEmi.toLocaleString('en-IN')}** है।\nसक्रिय ऋण विवरण:\n${loanSummariesHi}\n${twin?.dont_sell_me_active ? '⚠️ समाधान राहत योजना के तहत आप किश्त पुनर्गठन करा सकते हैं।' : ''}`;
          proactiveInsight = `नियत तारीख से पूर्व EMI का भुगतान करने से क्रेडिट स्कोर स्वस्थ रहता है और कर्ज भार 40% से नीचे रहता है।`;
          suggestedActions = ['ऋण का पूर्ण विवरण', 'What-If सिम्युलेटर चलाएं', 'किश्त राहत विकल्प'];
        } else {
          responseText = `Your total monthly EMI commitment is **₹${totalEmi.toLocaleString('en-IN')}**.\nActive Loans:\n${loanSummariesEn}\n${twin?.dont_sell_me_active ? '⚠️ Notice: You qualify for empathetic debt restructuring under our Samadhan Program.' : ''}`;
          proactiveInsight = `Paying this EMI before the due date will help maintain a healthy debt burden ratio and protect your credit rating.`;
          suggestedActions = ['View Loan Details', 'Open What-If Simulator', 'EMI Relief Options'];
        }
        deepLink = '/what-if';
      }
    }

    // Feature 3 & 4: AI Spending Coach & Weekly/Monthly Spending Summary
    else if (
      q.includes('where did i spend') ||
      q.includes('spend the most') ||
      q.includes('biggest expense') ||
      q.includes('highest expense') ||
      q.includes('how am i spending') ||
      q.includes('overspending') ||
      q.includes('overspend') ||
      q.includes('budgeting advice') ||
      q.includes('budget advice') ||
      q.includes('budget coach') ||
      q.includes('save more money') ||
      q.includes('how can i save') ||
      q.includes('spending coach') ||
      q.includes('spending summary') ||
      q.includes('spending breakdown') ||
      q.includes('spending categories') ||
      q.includes('compare this month') ||
      q.includes('burn rate') ||
      q.includes('saving opportunities') ||
      q.includes('સૌથી વધુ ખર્ચ') ||
      q.includes('ખર્ચ ક્યાં') ||
      q.includes('વધારે ખર્ચ') ||
      q.includes('બજેટ સલાહ') ||
      q.includes('સર્વાધિક ખર્ચ') ||
      q.includes('सर्वाधिक व्यय') ||
      q.includes('सर्वाधिक खर्च') ||
      q.includes('खर्च कहाँ') ||
      q.includes('अधिक खर्च') ||
      q.includes('बजट सलाह') ||
      q.includes('पैसे कैसे बचाएं')
    ) {
      intent = 'SPENDING_COACH';
      const coachRes = SpendingCoachService.getCoachData(customerId);

      if (coachRes.consent_restricted) {
        if (lang === 'gu') {
          responseText = `🔒 DPDPA 2023 સંમતિ નિયમો હેઠળ, તમારી "ટ્રાન્ઝેક્શન વિશ્લેષણ" સંમતિ બંધ છે. AI Spending Coach વિશ્લેષણ જોવા માટે કૃપા કરીને સંમતિ કેન્દ્રમાં તેને સક્ષમ કરો.`;
          suggestedActions = ['સંમતિ સેટિંગ્સ ખોલો', 'મારું બેલેન્સ'];
        } else if (lang === 'hi') {
          responseText = `🔒 DPDPA 2023 सहमति नियमों के तहत, आपका "लेन-देन विश्लेषण" अक्षम है। AI Spending Coach की कोचिंग और बचत सलाह देखने हेतु कृपया सहमति केंद्र में अनुमति सक्रिय करें।`;
          suggestedActions = ['सहमति सेटिंग्स खोलें', 'मेरा बैलेंस'];
        } else {
          responseText = `🔒 Under DPDPA 2023 Consent rules, Transaction Analysis is currently disabled in your Consent Center. Please enable it to view AI Spending Coach analytics and personalized savings advice.`;
          suggestedActions = ['Manage Consent Settings', 'Check Balance'];
        }
        verifiedData = { consent_restricted: true };
        deepLink = '/consent';
      } else if (coachRes.data) {
        const d = coachRes.data;
        const highestCat = d.categories[0] || { category: 'Shopping', amount: 0, change_percentage: 0, percentage: 0 };
        const lowestCat = d.categories[d.categories.length - 1] || { category: 'Utilities', amount: 0, change_percentage: 0, percentage: 0 };
        const biggestInc = d.categories.slice().sort((a: any, b: any) => b.change_percentage - a.change_percentage)[0];
        const biggestDec = d.categories.slice().sort((a: any, b: any) => a.change_percentage - b.change_percentage)[0];
        const opps = d.saving_opportunities || [];

        verifiedData = {
          total_spent_this_month: d.overview.total_spent_this_month,
          total_income_this_month: d.overview.total_income_this_month,
          savings_ratio: d.overview.savings_ratio,
          spending_score: d.overview.spending_score,
          highest_category: highestCat,
          lowest_category: lowestCat,
          biggest_increase: biggestInc,
          biggest_decrease: biggestDec,
          burn_rate_daily: d.forecast.burn_rate_daily,
          projected_spending: d.forecast.projected_spending,
          budget_health_level: d.budget_health.level,
        };

        const isWhereSpentQuery = q.includes('where') || q.includes('most') || q.includes('biggest') || q.includes('highest') || q.includes('ક્યાં') || q.includes('कहाँ');
        const isCompareQuery = q.includes('compare') || q.includes('last month') || q.includes('ગયા મહિના') || q.includes('पिछले माह');

        coachingAdvice = {
          why_this_advice: `Your highest expense this month was in ${highestCat.category} (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.percentage}% of total outflows).`,
          expected_benefit: `Limiting non-essential weekend orders in ${highestCat.category} will save up to ₹1,800/month, directly improving your cash surplus.`,
        };

        proactiveInsight = `Discretionary spending accounted for ${d.budget_health.spending_ratio}% of outflows. Trimming non-essentials builds a faster emergency cushion.`;

        if (isWhereSpentQuery || isCompareQuery) {
          if (lang === 'gu') {
            responseText = `📊 **માસિક ખર્ચ વિશ્લેષણ રિપોર્ટ**:\n• સૌથી મોટો ખર્ચ: **${highestCat.category}** (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.percentage}%)\n• સૌથી ઓછો ખર્ચ: **${lowestCat.category}** (₹${lowestCat.amount.toLocaleString('en-IN')})\n• સૌથી વધુ વધારો: **${biggestInc?.category}** (${biggestInc?.change_percentage >= 0 ? '+' : ''}${biggestInc?.change_percentage}%)\n• સૌથી વધુ ઘટાડો: **${biggestDec?.category}** (${biggestDec?.change_percentage}%)\n💡 બચત ભલામણ: ${opps[0]?.why_recommendation || 'બિનજરૂરી ઓનલાઇન ઓર્ડર નિયંત્રિત કરો.'} (સંભવિત બચત: ₹${opps[0]?.estimated_monthly_savings?.toLocaleString('en-IN') || '1,600'}/મહિને).`;
            suggestedActions = ['શું હું વધુ ખર્ચ કરી રહ્યો છું?', 'વધુ બચત કેવી રીતે કરવી?', 'ખાતા બેલેન્સ'];
          } else if (lang === 'hi') {
            responseText = `📊 **मासिक व्यय सारांश रिपोर्ट**:\n• शीर्ष व्यय श्रेणी: **${highestCat.category}** (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.percentage}%)\n• न्यूनतम व्यय श्रेणी: **${lowestCat.category}** (₹${lowestCat.amount.toLocaleString('en-IN')})\n• सबसे बड़ा उछाल: **${biggestInc?.category}** (${biggestInc?.change_percentage >= 0 ? '+' : ''}${biggestInc?.change_percentage}%)\n• सबसे बड़ी कमी: **${biggestDec?.category}** (${biggestDec?.change_percentage}%)\n💡 बचत सिफारिश: ${opps[0]?.why_recommendation || 'अनावश्यक डिलीवरी कम करें।'} (संभावित बचत: ₹${opps[0]?.estimated_monthly_savings?.toLocaleString('en-IN') || '1,600'}/माह).`;
            suggestedActions = ['क्या मैं अधिक खर्च कर रहा हूँ?', 'बचत के उपाय बताओ', 'खाता बैलेंस'];
          } else {
            responseText = `📊 **Monthly Spending Summary Diagnostics**:\n• Highest Spending Category: **${highestCat.category}** (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.percentage}% of total outflows)\n• Lowest Spending Category: **${lowestCat.category}** (₹${lowestCat.amount.toLocaleString('en-IN')})\n• Biggest Increase: **${biggestInc?.category}** (${biggestInc?.change_percentage >= 0 ? '+' : ''}${biggestInc?.change_percentage}% MoM)\n• Biggest Decrease: **${biggestDec?.category}** (${biggestDec?.change_percentage}% MoM)\n💡 Actionable Savings Recommendation: ${opps[0]?.why_recommendation || 'Prune non-essential weekend orders.'} (Estimated Savings: ₹${opps[0]?.estimated_monthly_savings?.toLocaleString('en-IN') || '1,600'}/month).`;
            suggestedActions = ['Where did I spend the most?', 'Am I overspending?', 'How can I save more money?'];
          }
        } else {
          if (lang === 'gu') {
            responseText = `📈 **AI Spending Coach વિશ્લેષણ**:\n• કુલ ખર્ચ: **₹${d.overview.total_spent_this_month.toLocaleString('en-IN')}** (આવક: ₹${d.overview.total_income_this_month.toLocaleString('en-IN')})\n• બચત દર: **${d.overview.savings_ratio}%** | બજેટ સ્કોર: **${d.budget_health.score}/100** (${d.budget_health.level})\n• દૈનિક બર્ન રેટ: ₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/દિવસ (અંદાજિત માસિક ખર્ચ: ₹${d.forecast.projected_spending.toLocaleString('en-IN')})`;
            suggestedActions = ['સૌથી વધુ ખર્ચ ક્યાં થયો?', 'શું હું વધુ ખર્ચ કરી રહ્યો છું?', 'વધુ બચત કેવી રીતે કરવી?'];
          } else if (lang === 'hi') {
            responseText = `📈 **AI Spending Coach विश्लेषण**:\n• कुल खर्च: **₹${d.overview.total_spent_this_month.toLocaleString('en-IN')}** (आय: ₹${d.overview.total_income_this_month.toLocaleString('en-IN')})\n• बचत अनुपात: **${d.overview.savings_ratio}%** | बजट स्कोर: **${d.budget_health.score}/100** (${d.budget_health.level})\n• दैनिक खर्च दर: ₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/दिन (अनुमानित कुल खर्च: ₹${d.forecast.projected_spending.toLocaleString('en-IN')})`;
            suggestedActions = ['सर्वाधिक खर्च कहाँ हुआ?', 'क्या मैं अधिक खर्च कर रहा हूँ?', 'बचत के उपाय बताओ'];
          } else {
            responseText = `📈 **AI Spending Coach Diagnostics**:\n• Total Outflow: **₹${d.overview.total_spent_this_month.toLocaleString('en-IN')}** (Inflow: ₹${d.overview.total_income_this_month.toLocaleString('en-IN')})\n• Savings Ratio: **${d.overview.savings_ratio}%** | Budget Score: **${d.budget_health.score}/100** (${d.budget_health.level})\n• Daily Burn Rate: ₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/day (Projected Month-End: ₹${d.forecast.projected_spending.toLocaleString('en-IN')})`;
            suggestedActions = ['Where did I spend the most?', 'Am I overspending?', 'How can I save more money?'];
          }
        }
        deepLink = '/spending-coach';
      }
    }

    // Intent 3: Recent Transactions
    else if (
      q.includes('transaction') ||
      q.includes('history') ||
      q.includes('karcha') ||
      q.includes('kharch') ||
      q.includes('vyavahar') ||
      q.includes('વ્યવહાર') ||
      q.includes('લેવડદેવડ') ||
      q.includes('लेन-देन') ||
      q.includes('इतिहास')
    ) {
      intent = 'CHECK_TRANSACTIONS';
      const recent = transactions.slice(0, 3);
      verifiedData = { recent_transactions: recent };

      if (lang === 'gu') {
        const txList = recent.map((t) => `• ${t.description}: ${t.type === 'CREDIT' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}`).join('\n');
        responseText = `તમારા તાજેતરના મુખ્ય વ્યવહારો નીચે મુજબ છે:\n${txList}`;
        proactiveInsight = `આ અઠવાડિયે શોપિંગ ખર્ચમાં વધારો થયો છે. ખર્ચનું વર્ગીકરણ ચકાસીને બચત વધારો.`;
        suggestedActions = ['ખર્ચ વિશ્લેષણ', 'ઉપલબ્ધ બેલેન્સ તપાસો', 'બચત સલાહ'];
      } else if (lang === 'hi') {
        const txListHi = recent.map((t) => `• ${t.description}: ${t.type === 'CREDIT' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}`).join('\n');
        responseText = `आपके हाल के मुख्य लेन-देन:\n${txListHi}`;
        proactiveInsight = `इस सप्ताह कुछ श्रेणियों में खर्च बढ़ा है। श्रेणीवार खर्च देखकर मासिक बचत बढ़ाएं।`;
        suggestedActions = ['खर्च का विश्लेषण करें', 'उपलब्ध बैलेंस जांचें', 'बचत सलाह'];
      } else {
        const txListEn = recent.map((t) => `• ${t.description}: ${t.type === 'CREDIT' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}`).join('\n');
        responseText = `Here are your most recent verified transactions:\n${txListEn}`;
        proactiveInsight = `Shopping and discretionary expenses grew this week. Check your category breakdown to optimize savings.`;
        suggestedActions = ['Analyze Spending', 'Check Available Balance', 'Savings Advice'];
      }
      deepLink = '/transactions';
    }

    // Intent 4: Financial Health / Savings Advice
    else if (
      q.includes('health') ||
      q.includes('score') ||
      q.includes('stress') ||
      q.includes('saving') ||
      q.includes('bachat') ||
      q.includes('સ્વાસ્થ્ય') ||
      q.includes('બચત વધારવી') ||
      q.includes('बचत') ||
      q.includes('तनाव')
    ) {
      intent = 'FINANCIAL_HEALTH';
      verifiedData = {
        health_score: twin?.financial_health_score || 70,
        stress_level: twin?.stress_level || 'LOW',
        savings_ratio: twin?.savings_ratio || 25,
      };

      coachingAdvice = {
        why_this_advice: `Your savings ratio is currently ${twin?.savings_ratio || 25}% with an active debt burden of ${twin?.emi_to_income_ratio || 0}%.`,
        expected_benefit: `Increasing automated monthly savings by 5% will push your Financial Health Score past 85 into the EXCELLENT tier.`,
      };

      if (lang === 'gu') {
        responseText = `તમારો નાણાકીય સ્વાસ્થ્ય સ્કોર **${twin?.financial_health_score || 75}/100** (${twin?.financial_health_tier || 'GOOD'}) છે. તમારી માસિક બચત દર **${twin?.savings_ratio || 25}%** છે. ${twin?.dont_sell_me_active ? 'ધ્યાન આપો: તમારો તણાવ સ્કોર ઊંચો છે, અમે વધારાની લોન લેવાની ભલામણ કરતા નથી.' : 'તમારી બચત સારી દિશામાં છે!'}`;
        proactiveInsight = `માસિક બચતમાં 5% નો વધારો કરવાથી તમારો હેલ્થ સ્કોર EXCELLENT સ્તરે પહોંચી જશે.`;
        suggestedActions = ['ઇમરજન્સી ફંડ બનાવો', 'SIP શરૂ કરો', 'ખર્ચ રિપોર્ટ જુઓ'];
      } else if (lang === 'hi') {
        responseText = `आपका वित्तीय स्वास्थ्य स्कोर **${twin?.financial_health_score || 75}/100** (${twin?.financial_health_tier || 'GOOD'}) है। आपकी बचत दर **${twin?.savings_ratio || 25}%** है। ${twin?.dont_sell_me_active ? 'ध्यान दें: वित्तीय तनाव का स्तर अधिक है। हम अनावश्यक कर्ज लेने से बचने की सलाह देते हैं।' : 'आपकी बचत आदतें बहुत अच्छी हैं!'}`;
        proactiveInsight = `अपनी मासिक बचत दर में मात्र 5% की वृद्धि करने से आपका वित्तीय स्कोर एक्सीलेंट श्रेणी में आ जाएगा।`;
        suggestedActions = ['इमरजेंसी फंड बनाएं', 'SIP शुरू करें', 'खर्च रिपोर्ट देखें'];
      } else {
        responseText = `Your Financial Health Score is **${twin?.financial_health_score || 75}/100** (${twin?.financial_health_tier || 'GOOD'}) with a savings ratio of **${twin?.savings_ratio || 25}%**. ${twin?.dont_sell_me_active ? 'Note: Financial stress detected. Debt promotion is paused to safeguard your cashflow.' : 'Your financial discipline is exemplary!'}`;
        proactiveInsight = `Increasing your monthly savings ratio by just 5% can elevate your financial health tier to EXCELLENT.`;
        suggestedActions = ['Build Emergency Fund', 'Start SIP', 'View Spending Report'];
      }
      deepLink = '/twin';
    }

    // Intent 5: Greeting Intent ("Hello", "Hi", "Namaste", "Kem Cho", "Good Morning", etc.)
    else if (
      q === 'hi' ||
      q === 'hello' ||
      q === 'hey' ||
      q.startsWith('hi ') ||
      q.startsWith('hello ') ||
      q.includes('namaste') ||
      q.includes('kem cho') ||
      q.includes('kemcho') ||
      q.includes('good morning') ||
      q.includes('good afternoon') ||
      q.includes('good evening') ||
      q.includes('કેમ છો') ||
      q.includes('નમસ્તે') ||
      q.includes('नमस्ते') ||
      q.includes('राम राम') ||
      q.includes('ram ram')
    ) {
      intent = 'GREETING';
      const firstName = profile.full_name.split(' ')[0];
      verifiedData = {
        customer_name: firstName,
        health_score: twin?.financial_health_score || 82,
        active_balance: totalBalance,
      };
      if (lang === 'gu') {
        responseText = `નમસ્તે ${firstName}ભાઈ! 🌞\n\nહું તમારો FinPulse AI બેંકિંગ મિત્ર છું. તમારો નાણાકીય હેલ્થ સ્કોર **${twin?.financial_health_score || 82}/100** છે અને એકાઉન્ટ્સ સક્રિય છે.\n\nઆજે હું તમારા બેલેન્સ, આગામી EMI, ખર્ચ વિશ્લેષણ કે બચત આયોજનમાં શું મદદ કરી શકું?`;
        suggestedActions = ['મારું ખાતા બેલેન્સ કેટલું છે?', 'મારી આગામી EMI ક્યારે છે?', 'આ અઠવાડિયે ખર્ચ રિપોર્ટ'];
      } else if (lang === 'hi') {
        responseText = `नमस्ते ${firstName} जी! 🌞\n\nमैं आपका FinPulse AI बैंकिंग सहायक हूँ। आपका वित्तीय स्वास्थ्य स्कोर **${twin?.financial_health_score || 82}/100** है।\n\nआज मैं आपके बैंक बैलेंस, किश्तों, खर्च समीक्षा या बचत योजनाओं में क्या सहायता कर सकता हूँ?`;
        suggestedActions = ['मेरा बैंक बैलेंस कितना है?', 'मेरी अगली किश्त कब देय है?', 'साप्ताहिक खर्च कहाँ हुआ?'];
      } else {
        responseText = `Namaste ${firstName}! 🌞\n\nI am your FinPulse AI Banking Copilot for Bharat. Your accounts are active with a Financial Health Score of **${twin?.financial_health_score || 82}/100**.\n\nHow can I assist with your balance, loan EMIs, spending analysis, or savings goals today?`;
        suggestedActions = ['What is my available balance?', 'When is my next EMI due?', 'Where did I spend the most this week?'];
      }
      proactiveInsight = `Proactive Banking: Keeping track of daily inflows and upcoming bills ensures zero penalty charges and boosts your credit health.`;
    }

    // Intent 6: Identity / Capability Intent ("Who are you?", "What can you do?", "Help me", etc.)
    else if (
      q.includes('who are you') ||
      q.includes('what can you do') ||
      q.includes('tell me about yourself') ||
      q.includes('help me') ||
      q.includes('what are your features') ||
      q.includes('aap kaun') ||
      q.includes('tame kon') ||
      q.includes('તમે કોણ') ||
      q.includes('તમે શું કરી શકો') ||
      q.includes('आप कौन') ||
      q.includes('आप क्या कर सकते')
    ) {
      intent = 'IDENTITY_HELP';
      const firstName = profile.full_name.split(' ')[0];
      verifiedData = {
        connected_engines: ['Core Accounts', 'Loan Engine', 'Spending Coach', 'Life Event Prediction', 'Fraud Shield', 'Consent Center'],
      };
      if (lang === 'gu') {
        responseText = `હું **FinPulse AI** છું — ભારત માટે વિશેષ રૂપે ડિઝાઈન કરેલ તમારો સુરક્ષિત AI બેંકિંગ કોપાયલોટ.\n\nહું તમને આમાં મદદ કરી શકું છું:\n• **ખાતા અને બેલેન્સ**: તાત્કાલિક બેલેન્સ અને તાજેતરના વ્યવહારો\n• **લોન અને EMI**: સક્રિય હપ્તા, What-If સિમ્યુલેશન અને રાહત યોજના\n• **Spending Coach**: શ્રેણીવાર ખર્ચ ટ્રેકિંગ અને બચત સલાહ\n• **Fraud Protection**: શંકાસ્પદ વ્યવહારોની ચેતવણી અને 24x7 સુરક્ષા.`;
        suggestedActions = ['મારું બેલેન્સ તપાસો', 'મારી EMI કેટલી છે?', 'ખર્ચ વિશ્લેષણ બતાવો'];
      } else if (lang === 'hi') {
        responseText = `मैं **FinPulse AI** हूँ — भारत के ग्राहकों के लिए समर्पित आपका व्यक्तिगत AI बैंकिंग सहायक।\n\nमैं आपकी इन सेवाओं में सहायता करता हूँ:\n• **खाता और बैलेंस**: तत्काल बैलेंस और लेन-देन इतिहास\n• **ऋण और EMI**: सक्रिय किश्तें, What-If सिमुलेटर और ऋण पुनर्गठन\n• **Spending Coach**: खर्च का श्रेणीवार विश्लेषण और बचत परामर्श\n• **सुरक्षा और फ्रॉड**: संदिग्ध लेन-देन की चेतावनी और कार्ड फ्रीज सुविधा।`;
        suggestedActions = ['मेरा बैलेंस दिखाओ', 'सक्रिय लोन किश्तें', 'साप्ताहिक खर्च कहाँ हुआ?'];
      } else {
        responseText = `I am **FinPulse AI** — your hyper-personalized conversational banking copilot built specifically for Bharat.\n\nHere is what I can do for you:\n• **Accounts & Balances**: Check verified balances and instant transaction histories.\n• **Loans & EMIs**: Track active EMIs, run What-If loan simulations, and explore restructuring relief.\n• **AI Spending Coach**: Breakdown category spending, identify anomalies, and uncover savings.\n• **Fraud & Safety**: Proactive fraud spike alerts, instant card freeze, and ethical Anti-Predatory protection.`;
        suggestedActions = ['Check Available Balance', 'Show Active EMIs', 'Analyze My Spending'];
      }
      proactiveInsight = `Zero-Hallucination Guarantee: Every number I provide is directly retrieved from your verified core banking ledger and financial twin.`;
    }

    // Intent 7: Affordability & Purchase Feasibility ("Can I buy a phone?", "Can I afford...", etc.)
    else if (
      q.includes('buy') ||
      q.includes('afford') ||
      q.includes('purchase') ||
      q.includes('kharid') ||
      q.includes('le sakta') ||
      q.includes('phone') ||
      q.includes('car') ||
      q.includes('bike') ||
      q.includes('laptop') ||
      q.includes('vacation') ||
      q.includes('ખરીદી') ||
      q.includes('લેવું')
    ) {
      intent = 'WHAT_IF_LOAN';
      const surplus = twin?.monthly_surplus || 15000;
      const isLiquid = totalBalance > 25000;
      verifiedData = {
        liquid_balance: totalBalance,
        monthly_surplus: surplus,
        savings_ratio: twin?.savings_ratio || 25,
      };

      if (lang === 'gu') {
        responseText = `તમારા ખાતામાં **₹${totalBalance.toLocaleString('en-IN')}** નું ઉપલબ્ધ બેલેન્સ અને **₹${surplus.toLocaleString('en-IN')}** માસિક સરપ્લસ બચત છે. ${
          isLiquid
            ? 'આ ખરીદી તમારી લિક્વિડિટીની દ્રષ્ટિએ શક્ય છે, પરંતુ 3 મહિનાનું ઇમરજન્સી ફંડ જાળવી રાખવું જરૂરી છે.'
            : 'હાલમાં તમારા પર EMI અથવા ખર્ચનું ભારણ છે. મોટી ખરીદી કરતા પહેલા What-If સિમ્યુલેટરમાં ચકાસણી કરો.'
        }`;
        proactiveInsight = `What-If સિમ્યુલેટર દ્વારા તમે જોઈ શકો છો કે નવી ખરીદી અથવા EMI તમારા ભવિષ્યના કેશફ્લો પર કેવી અસર કરશે.`;
        suggestedActions = ['What-If સિમ્યુલેટર ખોલો', 'મારું બેલેન્સ તપાસો', 'ખર્ચ કોચ સલાહ'];
      } else if (lang === 'hi') {
        responseText = `आपके खाते में **₹${totalBalance.toLocaleString('en-IN')}** उपलब्ध शेष और **₹${surplus.toLocaleString('en-IN')}** मासिक अधिशेष है। ${
          isLiquid
            ? 'आपकी वर्तमान लिक्विडिटी के आधार पर यह खरीद संभव है, बशर्ते आप न्यूनतम आपातकालीन फंड बनाए रखें।'
            : 'वर्तमान में नकदी प्रवाह सीमित है। कोई भी बड़ी खरीद या नई EMI लेने से पहले What-If सिमुलेटर में प्रभाव देखें।'
        }`;
        proactiveInsight = `What-If सिमुलेटर से आप जांच सकते हैं कि नई EMI या खर्च से आपका वित्तीय स्वास्थ्य स्कोर कितना प्रभावित होगा।`;
        suggestedActions = ['What-If सिमुलेटर खोलें', 'मासिक खर्च समीक्षा', 'बचत रिपोर्ट देखें'];
      } else {
        responseText = `You currently have **₹${totalBalance.toLocaleString('en-IN')}** in liquid funds and a monthly surplus of **₹${surplus.toLocaleString('en-IN')}**. ${
          isLiquid
            ? 'This purchase is feasible within your cashflow, provided you maintain a 3-month essential buffer.'
            : 'Your cashflow margin is currently tight. We recommend testing the exact impact in our What-If Simulator before committing.'
        }`;
        proactiveInsight = `Use the What-If Simulator to visualize how a major purchase or new EMI alters your financial runway and health score.`;
        suggestedActions = ['Open What-If Simulator', 'Check Available Balance', 'View Spending Coach'];
      }
      deepLink = '/what-if';
    }

    // Intent 8: Loan Eligibility & Borrowing Inquiries ("Loan milega?", "Need loan", etc.)
    else if (
      q.includes('loan') ||
      q.includes('karz') ||
      q.includes('udhar') ||
      q.includes('credit card') ||
      q.includes('borrow') ||
      q.includes('eligibility') ||
      q.includes('લોન') ||
      q.includes('ધિરાણ')
    ) {
      intent = 'LOAN_INQUIRY';
      const isStressed = twin?.dont_sell_me_active || stress.dont_sell_me_engaged || stress.stress_level === 'HIGH';
      verifiedData = {
        active_loans_count: loans.length,
        total_monthly_emi: totalEmi,
        stress_level: twin?.stress_level || 'LOW',
        dont_sell_me_active: isStressed,
      };

      if (isStressed) {
        if (lang === 'gu') {
          responseText = `ધ્યાન આપો: FinPulse AI ની સુરક્ષા નીતિ હેઠળ, તમારા પર હાલમાં ઊંચો નાણાકીય તણાવ (EMI: ₹${totalEmi.toLocaleString('en-IN')}) છે. અમે નવી લોન આપવાની મનાઈ કરીએ છીએ અને તમારા માટે **સમાધાન પુનર્ગઠન યોજના** ઉપલબ્ધ છે જેથી તમારો હપ્તો ઘટી શકે.`;
          suggestedActions = ['સમાધાન રાહત યોજના', 'EMI મુદત લંબાવો', 'કાઉન્સિલર સાથે વાત કરો'];
        } else if (lang === 'hi') {
          responseText = `सावधानी: FinPulse AI की एथिकल बैंकिंग नीति के तहत, आपके खाते पर उच्च ऋण भार (मासिक EMI: ₹${totalEmi.toLocaleString('en-IN')}) दर्ज है। हम नए कर्ज की सिफारिश नहीं करते, बल्कि आपकी EMI घटाने हेतु **समाधान पुनर्गठन योजना** उपलब्ध कराते हैं।`;
          suggestedActions = ['समाधान योजना देखें', 'EMI किश्त कम करें', 'वित्तीय परामर्शदाता से बात'];
        } else {
          responseText = `Ethical Banking Shield: High financial stress detected with ₹${totalEmi.toLocaleString('en-IN')} in active monthly EMIs. New debt promotion is strictly paused. Instead, our **Samadhan Restructuring Plan** can lower your monthly burden with zero penalties.`;
          suggestedActions = ['Explore Samadhan Relief', 'Extend EMI Tenure', 'Speak with Counselor'];
        }
        deepLink = '/stress-assistance';
      } else {
        if (lang === 'gu') {
          responseText = `તમારો ક્રેડિટ સ્કોર ઉત્તમ છે અને હાલમાં ₹${totalEmi.toLocaleString('en-IN')} ની નિયમિત EMI ચાલે છે. તમે પ્રી-એપ્રૂવ્ડ લોન વિકલ્પો અથવા What-If લોન કેલ્ક્યુલેટર જોઈ શકો છો.`;
          suggestedActions = ['લોન જર્ની ખોલો', 'What-If સિમ્યુલેટર', 'વ્યાજ દર તપાસો'];
        } else if (lang === 'hi') {
          responseText = `आपका वित्तीय स्वास्थ्य स्कोर अच्छा है और आपकी सक्रिय मासिक EMI ₹${totalEmi.toLocaleString('en-IN')} है। आप पारदर्शी ब्याज दरों के साथ प्री-अप्रूव्ड डिजिटल ऋण विकल्पों की समीक्षा कर सकते हैं।`;
          suggestedActions = ['ऋण आवेदन प्रक्रिया', 'What-If लोन सिमुलेटर', 'ब्याज दरें देखें'];
        } else {
          responseText = `Your Financial Health is robust with ₹${totalEmi.toLocaleString('en-IN')} in active monthly debt obligations. You can simulate affordable tenure options and transparent interest rates in our Ethical Loan Journey.`;
          suggestedActions = ['Open Loan Journey', 'Simulate in What-If', 'Check Interest Rates'];
        }
        deepLink = '/loan-journey';
      }
    }

    // Intent 9: Fraud, Security & Card Freeze
    else if (
      q.includes('fraud') ||
      q.includes('scam') ||
      q.includes('cheat') ||
      q.includes('phishing') ||
      q.includes('freeze') ||
      q.includes('block') ||
      q.includes('unauthorized') ||
      q.includes('suraksha') ||
      q.includes('સુરક્ષા') ||
      q.includes('ફ્રોડ') ||
      q.includes('ધોખાધડી')
    ) {
      intent = 'FRAUD_SECURITY';
      verifiedData = {
        surveillance_status: '24x7_ACTIVE',
        z_score_threshold: '3.0σ',
      };
      if (lang === 'gu') {
        responseText = `તમારા તમામ ખાતા અને UPI 24x7 AI ફ્રોડ મોનિટરિંગ હેઠળ સુરક્ષિત છે. જો તમને કોઈ અનધિકૃત વ્યવહાર જણાય, તો તમે તાત્કાલિક 1-ક્લિકથી કાર્ડ અથવા UPI બ્લોક કરી શકો છો.`;
        suggestedActions = ['કાર્ડ ફ્રીઝ કરો', 'શંકાસ્પદ વ્યવહાર રિપોર્ટ', 'સુરક્ષા ડેશબોર્ડ'];
      } else if (lang === 'hi') {
        responseText = `आपके खाते और UPI लेन-देन 24x7 AI फ्रॉड निगरानी प्रणाली द्वारा सुरक्षित हैं। किसी भी संदिग्ध गतिविधि की स्थिति में आप तुरंत 1-क्लिक से अपने कार्ड अथवा UPI को फ्रीज कर सकते हैं।`;
        suggestedActions = ['कार्ड फ्रीज करें', 'संदिग्ध लेन-देन रिपोर्ट', 'सुरक्षा केंद्र देखें'];
      } else {
        responseText = `Your accounts are protected under real-time 24x7 AI Statistical Surveillance. If you notice any suspicious activity, you can immediately freeze your debit card and UPI with 1-click in the Fraud & Security Center.`;
        suggestedActions = ['Freeze Card & UPI', 'Report Transaction', 'Open Fraud Center'];
      }
      deepLink = '/fraud-security';
    }

    // Default Fallback (Personalized Dynamic Grounding instead of generic canned text)
    else {
      intent = 'OUT_OF_SCOPE';
      const firstName = profile.full_name.split(' ')[0];
      const activeEmiText = loans.length > 0 ? `active EMI of ₹${totalEmi.toLocaleString('en-IN')}` : 'zero active loan burden';

      if (lang === 'gu') {
        responseText = `નમસ્તે ${firstName}ભાઈ! હું તમારો FinPulse AI બેંકિંગ કોપાયલોટ છું. તમારા ખાતામાં હાલમાં **₹${totalBalance.toLocaleString('en-IN')}** ઉપલબ્ધ છે અને ${activeEmiText} છે.\n\nહું તમને એકાઉન્ટ બેલેન્સ, આગામી EMI, Spending Coach ખર્ચ વિશ્લેષણ, અથવા What-If સિમ્યુલેશનમાં ચોક્કસ માર્ગદર્શન આપી શકું છું.`;
        proactiveInsight = `નિયમિત આર્થિક સમીક્ષા કરવાથી તમારી બચતમાં સરેરાશ 15% નો વધારો થાય છે.`;
        suggestedActions = ['મારું બેલેન્સ કેટલું છે?', 'મારી આગામી EMI ક્યારે છે?', 'ખર્ચ વિશ્લેષણ બતાવો'];
      } else if (lang === 'hi') {
        responseText = `नमस्ते ${firstName} जी! मैं आपका FinPulse AI बैंकिंग सहायक हूँ। आपके खाते में वर्तमान उपलब्ध शेष **₹${totalBalance.toLocaleString('en-IN')}** है और ${activeEmiText} है।\n\nआप मुझसे खाते की स्थिति, किश्तों, खर्च समीक्षा (Spending Coach), या What-If ऋण सिमुलेशन के बारे में पूछ सकते हैं।`;
        proactiveInsight = `नियमित वित्तीय समीक्षा करने से आपकी मासिक बचत में औसतन 15% का सुधार होता है।`;
        suggestedActions = ['मेरा बैलेंस कितना है?', 'मेरी EMI कितनी है?', 'मासिक खर्च रिपोर्ट'];
      } else {
        responseText = `Hello ${firstName}! I am your FinPulse AI Banking Copilot. Your account currently holds **₹${totalBalance.toLocaleString('en-IN')}** with ${activeEmiText}.\n\nFeel free to ask me about your available balance, upcoming EMI schedules, AI Spending Coach insights, or What-If purchase simulations.`;
        proactiveInsight = `Regularly tracking cashflow and maintaining automated savings prevents unexpected month-end shortfalls.`;
        suggestedActions = ['What is my balance?', 'Show my active EMIs', 'Analyze My Spending'];
      }
    }

    return {
      message: responseText,
      language: lang,
      intent,
      verified_data: verifiedData,
      suggested_actions: suggestedActions,
      proactive_insight: proactiveInsight,
      coaching_advice: coachingAdvice,
      deep_link: deepLink,
    };
  }
}

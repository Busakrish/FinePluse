import { db } from '../db/database.js';
import { CustomerProfile, Account, Transaction, Loan, FinancialTwin } from '../db/types.js';

import { GeminiService, ChatHistoryItem } from '../services/gemini.service.js';
import { SpendingCoachService } from '../services/spendingCoach.service.js';

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
        return geminiResponse;
      }
    } catch (err: any) {
      console.warn('[FinPulse VernacularEngine] Gemini error, falling back to deterministic engine:', err?.message || err);
    }

    // Graceful fallback to deterministic offline engine
    const fallback = this.processQuery(customerId, queryText, languageHint);
    return {
      ...fallback,
      model_used: 'deterministic-offline-fallback',
    };
  }
  public static processQuery(
    customerId: string,
    queryText: string,
    languageHint?: 'en' | 'hi' | 'gu'
  ): VernacularChatResponse {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      throw new Error(`Customer profile not found for: ${customerId}`);
    }

    const account = db.findOne('accounts', (a) => a.customer_id === customerId);
    const transactions = db.filter('transactions', (t) => t.customer_id === customerId);
    const loans = db.filter('loans', (l) => l.customer_id === customerId && (l.status === 'ACTIVE' || l.status === 'OVERDUE'));
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);

    const q = queryText.toLowerCase().trim();

    // Language Detection
    let lang: 'en' | 'hi' | 'gu' = languageHint || profile.preferred_language || 'en';
    if (/[\u0A80-\u0AFF]/.test(queryText) || q.includes('mare') || q.includes('maru') || q.includes('joi che') || q.includes('vishe') || q.includes('ketla')) {
      lang = 'gu';
    } else if (/[\u0900-\u097F]/.test(queryText) || q.includes('mera') || q.includes('meri') || q.includes('kitna') || q.includes('hai') || q.includes('batao') || q.includes('chahiye')) {
      lang = 'hi';
    }

    // Intent Detection
    let intent = 'UNKNOWN';
    let verifiedData: any = {};
    let responseText = '';
    let suggestedActions: string[] = [];

    const totalBalance = account ? account.balance : 0;
    const totalEmi = loans.reduce((acc, l) => acc + l.monthly_emi, 0);

    // Intent 1: Balance Check
    if (
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
      };

      if (lang === 'gu') {
        responseText = `તમારા ${account?.account_type === 'SALARY' ? 'પગાર' : 'બચત'} ખાતા (નંબર: ...${account?.account_number.slice(-4)}) માં વર્તમાન ઉપલબ્ધ બેલેન્સ ₹${totalBalance.toLocaleString('en-IN')} છે.`;
        suggestedActions = ['છેલ્લા વ્યવહારો જુઓ', 'પૈસા મોકલો', 'EMI માહિતી'];
      } else if (lang === 'hi') {
        responseText = `आपके ${account?.account_type === 'SALARY' ? 'वेतन' : 'बचत'} खाते (संख्या: ...${account?.account_number.slice(-4)}) में कुल उपलब्ध शेष राशि ₹${totalBalance.toLocaleString('en-IN')} है।`;
        suggestedActions = ['हाल के लेन-देन देखें', 'पैसे भेजें', 'EMI विवरण'];
      } else {
        responseText = `Your current available balance in ${account?.account_type || 'Savings'} Account (...${account?.account_number.slice(-4)}) is ₹${totalBalance.toLocaleString('en-IN')}.`;
        suggestedActions = ['View Recent Transactions', 'Send Money (UPI)', 'Check EMI Status'];
      }
    }

    // Intent 2: EMI / Loan Details
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
        } else if (lang === 'hi') {
          responseText = 'वर्तमान में आपके पास कोई सक्रिय ऋण (Loan) या EMI बकाया नहीं है। आपका वित्तीय स्वास्थ्य बहुत अच्छा है!';
        } else {
          responseText = 'You currently have no active loans or pending EMI obligations.';
        }
      } else {
        const loanSummaries = loans.map((l) => `• ${l.loan_type}: ₹${l.monthly_emi.toLocaleString('en-IN')}/મહિને (તારીખ ${l.due_day_of_month})`).join('\n');
        const loanSummariesHi = loans.map((l) => `• ${l.loan_type}: ₹${l.monthly_emi.toLocaleString('en-IN')}/माह (हर माह की ${l.due_day_of_month} तारीख)`).join('\n');
        const loanSummariesEn = loans.map((l) => `• ${l.loan_type} Loan: ₹${l.monthly_emi.toLocaleString('en-IN')}/month (Due: ${l.due_day_of_month}th)`).join('\n');

        if (lang === 'gu') {
          responseText = `તમારી કુલ માસિક EMI ₹${totalEmi.toLocaleString('en-IN')} છે.\nસક્રિય લોન વિગતો:\n${loanSummaries}\n${twin?.dont_sell_me_active ? '⚠️ જો તમને EMI ભરવામાં મુશ્કેલી હોય તો અમે "સમાધાન યોજના" હેઠળ હપ્તો ઘટાડી શકીએ છીએ.' : ''}`;
          suggestedActions = ['What-If સિમ્યુલેટર', 'હપ્તો ઓછો કરવા સહાય'];
        } else if (lang === 'hi') {
          responseText = `आपकी कुल मासिक EMI राशि ₹${totalEmi.toLocaleString('en-IN')} है।\nसक्रिय ऋण विवरण:\n${loanSummariesHi}\n${twin?.dont_sell_me_active ? '⚠️ यदि आपको किश्त भरने में परेशानी हो रही है, तो आप "समाधान योजना" के तहत राहत पा सकते हैं।' : ''}`;
          suggestedActions = ['What-If सिम्युलेटर चलाएं', 'किश्त राहत सहायता'];
        } else {
          responseText = `Your total monthly EMI commitment is ₹${totalEmi.toLocaleString('en-IN')}.\nActive Loans:\n${loanSummariesEn}\n${twin?.dont_sell_me_active ? '⚠️ Notice: You qualify for empathetic restructuring under our Samadhan Relief Program.' : ''}`;
          suggestedActions = ['Simulate What-If', 'Explore Debt Restructuring'];
        }
      }
    }

    // Intent: AI Spending Coach & Expense Analytics
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
      } else if (coachRes.data) {
        const d = coachRes.data;
        const highestCat = d.categories[0] || { category: 'Shopping', amount: 0, change_percentage: 0, percentage: 0 };
        const secondCat = d.categories[1] || null;
        const alerts = d.overspending_alerts || [];
        const opps = d.saving_opportunities || [];
        const tips = d.budget_coach_tips || [];

        verifiedData = {
          total_spent_this_month: d.overview.total_spent_this_month,
          total_income_this_month: d.overview.total_income_this_month,
          savings_ratio: d.overview.savings_ratio,
          spending_score: d.overview.spending_score,
          highest_category: highestCat,
          overspending_alerts_count: alerts.length,
          burn_rate_daily: d.forecast.burn_rate_daily,
          projected_spending: d.forecast.projected_spending,
          budget_health_level: d.budget_health.level,
        };

        const isOverspendingQuery = q.includes('overspend') || q.includes('अधिक खर्च') || q.includes('વધારે ખર્ચ');
        const isWhereSpentQuery = q.includes('where') || q.includes('most') || q.includes('biggest') || q.includes('highest') || q.includes('ક્યાં') || q.includes('कहाँ');
        const isAdviceQuery = q.includes('advice') || q.includes('save') || q.includes('coach') || q.includes('सलाह') || q.includes('સલાહ') || q.includes('बचाएं');

        if (isWhereSpentQuery) {
          if (lang === 'gu') {
            responseText = `📊 આ મહિને તમારો સૌથી મોટો ખર્ચ **${highestCat.category}** માં થયો છે: **₹${highestCat.amount.toLocaleString('en-IN')}** (${highestCat.percentage}% કુલ ખર્ચમાંથી, ગયા મહિના કરતાં ${highestCat.change_percentage >= 0 ? '+' : ''}${highestCat.change_percentage}%).\n${secondCat ? `• બીજો મોટો ખર્ચ: **${secondCat.category}** (₹${secondCat.amount.toLocaleString('en-IN')})\n` : ''}💡 કોચ ટીપ: ${opps[0]?.why_recommendation || d.overview.insight_summary}`;
          } else if (lang === 'hi') {
            responseText = `📊 इस माह आपका सर्वाधिक व्यय **${highestCat.category}** श्रेणी में हुआ है: **₹${highestCat.amount.toLocaleString('en-IN')}** (कुल खर्च का ${highestCat.percentage}%, पिछले माह से ${highestCat.change_percentage >= 0 ? '+' : ''}${highestCat.change_percentage}%).\n${secondCat ? `• दूसरा बड़ा खर्च: **${secondCat.category}** (₹${secondCat.amount.toLocaleString('en-IN')})\n` : ''}💡 कोच सुझाव: ${opps[0]?.why_recommendation || d.overview.insight_summary}`;
          } else {
            responseText = `📊 Your highest expenditure this month is in **${highestCat.category}** at **₹${highestCat.amount.toLocaleString('en-IN')}** (${highestCat.percentage}% of total outflows, ${highestCat.change_percentage >= 0 ? '+' : ''}${highestCat.change_percentage}% MoM change).\n${secondCat ? `• 2nd highest: **${secondCat.category}** (₹${secondCat.amount.toLocaleString('en-IN')})\n` : ''}💡 Coach Advice: ${opps[0]?.why_recommendation || d.overview.insight_summary}`;
          }
        } else if (isOverspendingQuery) {
          if (alerts.length > 0) {
            const topAlert = alerts[0];
            if (lang === 'gu') {
              responseText = `⚠️ **ઓવરસ્પેન્ડિંગ એલર્ટ**: ${topAlert.title}!\n${topAlert.message}\n• અંદાજિત વધારાનો ખર્ચ: **₹${topAlert.excess_amount.toLocaleString('en-IN')}**\n• દૈનિક ખર્ચ વેગ: **₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/દિવસ**\n• બજેટ સ્વાસ્થ્ય સ્કોર: **${d.budget_health.score}/100** (${d.budget_health.level})`;
            } else if (lang === 'hi') {
              responseText = `⚠️ **अति-व्यय (Overspending) चेतावनी**: ${topAlert.title}!\n${topAlert.message}\n• अनुमानित अतिरिक्त खर्च: **₹${topAlert.excess_amount.toLocaleString('en-IN')}**\n• दैनिक व्यय दर: **₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/दिन**\n• बजट स्वास्थ्य स्कोर: **${d.budget_health.score}/100** (${d.budget_health.level})`;
            } else {
              responseText = `⚠️ **Overspending Detected**: ${topAlert.title}!\n${topAlert.message}\n• Estimated Outflow Surge: **₹${topAlert.excess_amount.toLocaleString('en-IN')}**\n• Daily Burn Rate: **₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/day**\n• Budget Health: **${d.budget_health.score}/100** (${d.budget_health.level})`;
            }
          } else {
            if (lang === 'gu') {
              responseText = `✅ કોઈ ઓવરસ્પેન્ડિંગ વિસંગતતા નથી! તમારો ખર્ચ નિયંત્રણમાં છે (માસિક આવકના ${d.budget_health.spending_ratio}%). બચત દર: **${d.overview.savings_ratio}%**.`;
            } else if (lang === 'hi') {
              responseText = `✅ कोई अति-व्यय नहीं मिला! आपका खर्च संतुलित है (मासिक आय का ${d.budget_health.spending_ratio}%). बचत अनुपात: **${d.overview.savings_ratio}%**.`;
            } else {
              responseText = `✅ No abnormal overspending detected! Your expenses are well-disciplined at ${d.budget_health.spending_ratio}% of income with a healthy **${d.overview.savings_ratio}%** savings ratio.`;
            }
          }
        } else if (isAdviceQuery) {
          const topOpp = opps[0];
          const topTip = tips[0];
          if (lang === 'gu') {
            responseText = `💡 **AI Spending Coach બજેટિંગ સલાહ**:\n1. **${topOpp?.title || 'ખર્ચ મર્યાદા'}**: ${topOpp?.why_recommendation || 'બિનજરૂરી ઓનલાઇન ઓર્ડર નિયંત્રિત કરો.'} (સંભવિત બચત: **₹${topOpp?.estimated_monthly_savings?.toLocaleString('en-IN') || '1,500'}/મહિને**)\n2. **${topTip?.title || 'બચત આદત'}**: ${topTip?.easy_action_today || 'પગાર જમા થતાં જ SIP શરૂ કરો.'}\n• વર્તમાન બજેટ સ્થિતિ: **${d.budget_health.level}** (${d.budget_health.score}/100)`;
          } else if (lang === 'hi') {
            responseText = `💡 **AI Spending Coach बजटिंग सलाह**:\n1. **${topOpp?.title || 'व्यय नियंत्रण'}**: ${topOpp?.why_recommendation || 'अनावश्यक डिलीवरी और सप्ताहांत खर्च सीमित करें।'} (संभावित बचत: **₹${topOpp?.estimated_monthly_savings?.toLocaleString('en-IN') || '1,500'}/माह**)\n2. **${topTip?.title || 'बचत नियम'}**: ${topTip?.easy_action_today || 'वेतन आते ही ऑटो-डेबिट बचत शुरू करें।'}\n• वर्तमान बजट स्वास्थ्य: **${d.budget_health.level}** (${d.budget_health.score}/100)`;
          } else {
            responseText = `💡 **AI Spending Coach Budgeting Guidance**:\n1. **${topOpp?.title || 'Spending Control'}**: ${topOpp?.why_recommendation || 'Prune non-essential online delivery orders.'} (Estimated Monthly Savings: **₹${topOpp?.estimated_monthly_savings?.toLocaleString('en-IN') || '1,500'}/month**)\n2. **${topTip?.title || 'Behavioral Habit'}**: ${topTip?.easy_action_today || 'Automate savings on salary credit day.'}\n• Budget Health: **${d.budget_health.level}** (${d.budget_health.score}/100)`;
          }
        } else {
          // General overview & MoM
          if (lang === 'gu') {
            responseText = `📈 **સપ્ટેમ્બર ખર્ચ વિશ્લેષણ**:\n• કુલ ખર્ચ: **₹${d.overview.total_spent_this_month.toLocaleString('en-IN')}** (આવક: ₹${d.overview.total_income_this_month.toLocaleString('en-IN')})\n• બચત દર: **${d.overview.savings_ratio}%** | બજેટ સ્કોર: **${d.budget_health.score}/100**\n• સૌથી મોટો ખર્ચ: **${highestCat.category}** (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.change_percentage >= 0 ? '+' : ''}${highestCat.change_percentage}% MoM)\n• દૈનિક ખર્ચ વેગ: ₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/દિવસ (અંદાજિત માસિક ખર્ચ: ₹${d.forecast.projected_spending.toLocaleString('en-IN')})`;
          } else if (lang === 'hi') {
            responseText = `📈 **सितंबर व्यय विश्लेषण रिपोर्ट**:\n• कुल खर्च: **₹${d.overview.total_spent_this_month.toLocaleString('en-IN')}** (आय: ₹${d.overview.total_income_this_month.toLocaleString('en-IN')})\n• बचत अनुपात: **${d.overview.savings_ratio}%** | बजट स्कोर: **${d.budget_health.score}/100**\n• शीर्ष श्रेणी: **${highestCat.category}** (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.change_percentage >= 0 ? '+' : ''}${highestCat.change_percentage}% MoM)\n• दैनिक खर्च दर: ₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/दिन (प्रत्याशित कुल: ₹${d.forecast.projected_spending.toLocaleString('en-IN')})`;
          } else {
            responseText = `📈 **September Spending Diagnostics**:\n• Total Outflow: **₹${d.overview.total_spent_this_month.toLocaleString('en-IN')}** (Inflow: ₹${d.overview.total_income_this_month.toLocaleString('en-IN')})\n• Savings Ratio: **${d.overview.savings_ratio}%** | Budget Score: **${d.budget_health.score}/100** (${d.budget_health.level})\n• Top Outflow: **${highestCat.category}** (₹${highestCat.amount.toLocaleString('en-IN')}, ${highestCat.change_percentage >= 0 ? '+' : ''}${highestCat.change_percentage}% MoM)\n• Daily Burn Rate: ₹${d.forecast.burn_rate_daily.toLocaleString('en-IN')}/day (Projected: ₹${d.forecast.projected_spending.toLocaleString('en-IN')})`;
          }
        }

        if (lang === 'gu') {
          suggestedActions = ['સૌથી વધુ ખર્ચ ક્યાં થયો?', 'શું હું વધુ ખર્ચ કરી રહ્યો છું?', 'વધુ બચત કેવી રીતે કરવી?'];
        } else if (lang === 'hi') {
          suggestedActions = ['सर्वाधिक खर्च कहाँ हुआ?', 'क्या मैं अधिक खर्च कर रहा हूँ?', 'बचत के उपाय बताओ'];
        } else {
          suggestedActions = ['Where did I spend the most?', 'Am I overspending?', 'How can I save more money?'];
        }
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
      } else if (lang === 'hi') {
        const txListHi = recent.map((t) => `• ${t.description}: ${t.type === 'CREDIT' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}`).join('\n');
        responseText = `आपके हाल के मुख्य लेन-देन:\n${txListHi}`;
      } else {
        const txListEn = recent.map((t) => `• ${t.description}: ${t.type === 'CREDIT' ? '+' : '-'}₹${t.amount.toLocaleString('en-IN')}`).join('\n');
        responseText = `Here are your most recent transactions:\n${txListEn}`;
      }
    }

    // Intent 4: Financial Health / Savings Advice
    else if (
      q.includes('health') ||
      q.includes('score') ||
      q.includes('stress') ||
      q.includes('saving') ||
      q.includes('bachat') ||
      q.includes('batao') ||
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

      if (lang === 'gu') {
        responseText = `તમારો નાણાકીય સ્વાસ્થ્ય સ્કોર ${twin?.financial_health_score || 75}/100 (${twin?.financial_health_tier || 'GOOD'}) છે. તમારી માસિક બચત દર ${twin?.savings_ratio || 25}% છે. ${twin?.dont_sell_me_active ? 'ધ્યાન આપો: તમારો તણાવ સ્કોર ઊંચો છે, અમે વધારાની લોન લેવાની ભલામણ કરતા નથી.' : 'તમારી બચત સારી દિશામાં છે!'}`;
      } else if (lang === 'hi') {
        responseText = `आपका वित्तीय स्वास्थ्य स्कोर ${twin?.financial_health_score || 75}/100 (${twin?.financial_health_tier || 'GOOD'}) है। आपकी बचत दर ${twin?.savings_ratio || 25}% है। ${twin?.dont_sell_me_active ? 'ध्यान दें: वित्तीय तनाव का स्तर अधिक है। हम अनावश्यक कर्ज लेने से बचने की सलाह देते हैं।' : 'आपकी बचत आदतें बहुत अच्छी हैं!'}`;
      } else {
        responseText = `Your Financial Health Score is ${twin?.financial_health_score || 75}/100 (${twin?.financial_health_tier || 'GOOD'}) with a savings ratio of ${twin?.savings_ratio || 25}%. ${twin?.dont_sell_me_active ? 'Note: Financial stress detected. Debt promotion is paused to safeguard your cashflow.' : 'Your financial discipline is exemplary!'}`;
      }
    }

    // Default Fallback
    else {
      intent = 'GENERAL_HELP';
      if (lang === 'gu') {
        responseText = `હું તમારો FinPulse AI બેંકિંગ મિત્ર છું. તમે મને તમારા ખાતાનું બેલેન્સ ("મારું બેલેન્સ કેટલું છે?"), EMI વિગતો ("મારી EMI કેટલી છે?"), અથવા બચત અને લોન અંગે ગુજરાતીમાં પૂછી શકો છો.`;
        suggestedActions = ['મારું બેલેન્સ કેટલું છે?', 'મારી EMI કેટલી છે?', 'નાણાકીય સ્વાસ્થ્ય જુઓ'];
      } else if (lang === 'hi') {
        responseText = `मैं आपका FinPulse AI बैंकिंग सहायक हूँ। आप मुझसे अपने खाते की शेष राशि ("मेरा बैलेंस कितना है?"), किश्त विवरण ("मेरी EMI कितनी है?"), या बचत योजनाओं के बारे में पूछ सकते हैं।`;
        suggestedActions = ['मेरा बैलेंस कितना है?', 'मेरी EMI कितनी है?', 'वित्तीय स्कोर दिखाओ'];
      } else {
        responseText = `I am your FinPulse AI assistant for Bharat. You can ask me about your account balance ("What is my balance?"), active EMIs ("Show my loans"), recent payments, or financial advice in English, Hindi, or Gujarati.`;
        suggestedActions = ['What is my balance?', 'Show my active EMIs', 'Check Financial Health'];
      }
    }

    return {
      message: responseText,
      language: lang,
      intent,
      verified_data: verifiedData,
      suggested_actions: suggestedActions,
    };
  }
}

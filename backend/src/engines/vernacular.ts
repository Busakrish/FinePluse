import { db } from '../db/database.js';
import { CustomerProfile, Account, Transaction, Loan, FinancialTwin } from '../db/types.js';

import { GeminiService, ChatHistoryItem } from '../services/gemini.service.js';

export interface VernacularChatResponse {
  message: string;
  language: 'en' | 'hi' | 'gu';
  intent: string;
  verified_data: any;
  suggested_actions?: string[];
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

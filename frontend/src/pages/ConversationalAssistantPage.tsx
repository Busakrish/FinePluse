import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BotMessageSquare,
  Send,
  User,
  Sparkles,
  CheckCircle,
  ShieldCheck,
  Languages,
  ExternalLink,
  RefreshCw,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Banknote,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Message {
  id: string;
  sender: 'USER' | 'ASSISTANT';
  content: string;
  language?: string;
  intent?: string;
  verified_data?: any;
  suggested_actions?: string[];
  deep_link?: string;
  model_used?: string;
  timestamp?: string;
}

export const ConversationalAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial welcome greeting
  const getWelcomeMessage = (lang: string): Message => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    if (lang === 'gu') {
      return {
        id: 'init_welcome',
        sender: 'ASSISTANT',
        content: `નમસ્તે ${firstName}! હું તમારો FinPulse AI બેંકિંગ મિત્ર છું.

હું તમારા બેંક ખાતા, સક્રિય EMI, તાજેતરના વ્યવહારો, બચત યોજનાઓ અને UPI સંબંધિત પ્રશ્નોના ઉત્તર આપી શકું છું. તમે સીધા ગુજરાતી અથવા Gujlish માં પૂછી શકો છો!`,
        suggested_actions: [
          'મારું ખાતા બેલેન્સ કેટલું છે?',
          'મારી આગામી EMI તારીખ કઈ છે?',
          'નાણાકીય સ્વાસ્થ્ય સ્કોર સમજાવો',
          'બચત વધારવા માટે શ્રેષ્ઠ યોજના કઈ?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    if (lang === 'hi') {
      return {
        id: 'init_welcome',
        sender: 'ASSISTANT',
        content: `नमस्ते ${firstName} जी! मैं आपका FinPulse AI बैंकिंग सहायक हूँ।

मैं आपके बैंक बैलेंस, सक्रिय लोन EMI, हालिया लेन-देन, वित्तीय स्वास्थ्य और UPI समस्याओं से जुड़े सभी सवालों के सटीक उत्तर दे सकता हूँ। आप हिंदी या Hinglish में बेझिझक पूछ सकते हैं!`,
        suggested_actions: [
          'मेरा वर्तमान बैलेंस कितना है?',
          'मेरी कुल मासिक EMI कितनी है?',
          'फाइनेंशियल हेल्थ स्कोर कैसे सुधारें?',
          'क्या मुझे नया लोन लेना चाहिए?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }
    return {
      id: 'init_welcome',
      sender: 'ASSISTANT',
      content: `Namaste ${firstName}! I am your FinPulse AI banking assistant for Bharat.

I am securely grounded with your verified core banking records, active loans, spending history, and Financial Twin. Ask me anything naturally in English, Hindi, or Gujarati!`,
      suggested_actions: [
        'What is my available balance?',
        'When is my next EMI due?',
        'Why is my financial health score low?',
        'Suggest the best investment for me',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Load conversation history on mount
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const res = await api.get('/chat/history');
        if (res.data?.success && Array.isArray(res.data.history) && res.data.history.length > 0) {
          const loaded: Message[] = res.data.history.map((m: any) => ({
            id: m.id,
            sender: m.sender,
            content: m.content,
            language: m.language,
            intent: m.intent_detected,
            verified_data: m.verified_data_used,
            timestamp: m.created_at
              ? new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined,
          }));
          setMessages(loaded);
        } else {
          setMessages([getWelcomeMessage(language)]);
        }
      } catch (err) {
        setMessages([getWelcomeMessage(language)]);
      }
    };

    loadChatHistory();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const toggleFacts = (id: string) => {
    setExpandedFacts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'USER',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        language: language,
      });

      if (res.data?.success && res.data?.response) {
        const botData = res.data.response;
        const botMsg: Message = {
          id: `a_${Date.now()}`,
          sender: 'ASSISTANT',
          content: botData.message,
          language: botData.language,
          intent: botData.intent,
          verified_data: botData.verified_data,
          suggested_actions: botData.suggested_actions,
          deep_link: botData.deep_link,
          model_used: botData.model_used,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Invalid chat response payload');
      }
    } catch (err: any) {
      console.error('Chat processing error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ASSISTANT',
          content:
            language === 'gu'
              ? 'ક્ષમા કરશો, હું આ સમયે તમારી વિનંતી પૂર્ણ કરી શક્યો નથી. કૃપા કરીને થોડી વાર પછી ફરી પ્રયાસ કરો.'
              : language === 'hi'
              ? 'क्षमा करें, सर्वर से संपर्क करने में समस्या हुई। कृपया कुछ समय बाद पुनः प्रयास करें।'
              : 'Sorry, I encountered a temporary connection issue. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setMessages([getWelcomeMessage(language)]);
  };

  // Categorized natural banking prompts
  const promptCategories = [
    {
      icon: Banknote,
      title: 'Accounts & Balance',
      prompts: [
        { label: 'Check Balance', query: 'What is my current available balance?' },
        { label: 'Recent Transactions', query: 'Show my last 5 debit and credit transactions.' },
      ],
    },
    {
      icon: CreditCard,
      title: 'Loans & EMI',
      prompts: [
        { label: 'Active EMIs', query: 'When is my next EMI due and what is the total monthly amount?' },
        { label: 'Can I take a Loan?', query: 'Can I afford a 2 Lakh personal or bike loan?' },
      ],
    },
    {
      icon: TrendingUp,
      title: 'Financial Health & SIP',
      prompts: [
        { label: 'Financial Score', query: 'Why is my financial health score at this level?' },
        { label: 'Best Investment', query: 'Suggest the best savings or SIP plan based on my surplus cash.' },
      ],
    },
    {
      icon: AlertTriangle,
      title: 'Safety, UPI & Relief',
      prompts: [
        { label: 'UPI Payment Failed', query: 'My UPI transaction failed and amount was deducted. What should I do?' },
        { label: 'Need EMI Relief', query: "I'm having trouble paying my EMI this month. What relief is available?" },
      ],
    },
  ];

  const vernacularQuickPills = [
    { label: '🇬🇧 "What is my active EMI?"', query: 'What is my active EMI?' },
    { label: '🇮🇳 "Mera balance kitna hai?"', query: 'Mera balance kitna hai?' },
    { label: '🇮🇳 "Maru balance ketlu che?"', query: 'Maru balance ketlu che?' },
    { label: '🇮🇳 "Mujhe loan ki jankari chahiye."', query: 'Mujhe loan ki jankari chahiye.' },
    { label: '🇮🇳 "Mare loan ni details joi che."', query: 'Mare loan ni details joi che.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-3 h-[calc(100vh-115px)] flex flex-col animate-in fade-in duration-200">
      {/* Top Banner: Real-time Gemini 2.5 Flash + Verified Grounding Pipeline */}
      <div className="flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-50 via-indigo-50 to-emerald-50 border border-blue-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
            <BotMessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">FinPulse AI Conversational Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                Gemini 2.5 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-600 hidden sm:block">
              Multilingual NLU grounded in verified core accounts, loans, Financial Twin & RBI Fair Lending policies.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/80 border border-slate-200 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Vernacular Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1 pl-1">
          <Languages className="w-3.5 h-3.5 text-blue-600" />
          Try:
        </span>
        {vernacularQuickPills.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(pill.query)}
            disabled={loading}
            className="whitespace-nowrap px-3 py-1 rounded-xl text-xs font-medium bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 shadow-2xs transition shrink-0 disabled:opacity-50"
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'USER';
          const isFactsExpanded = expandedFacts[m.id] || false;
          const hasVerifiedData =
            m.verified_data &&
            typeof m.verified_data === 'object' &&
            Object.keys(m.verified_data).length > 0 &&
            !m.verified_data.customer_id;

          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div className="space-y-2 max-w-[88%] sm:max-w-[80%]">
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs transition-all ${
                    isUser
                      ? 'bg-blue-700 text-white rounded-br-xs font-medium'
                      : 'bg-slate-50 border border-slate-200/80 text-slate-900 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line leading-relaxed">{m.content}</p>

                  {/* Metadata footer */}
                  <div
                    className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[10px] ${
                      isUser ? 'border-blue-600/60 text-blue-100' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {m.timestamp && <span>{m.timestamp}</span>}
                      {!isUser && m.intent && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" />
                          {m.intent}
                        </span>
                      )}
                      {!isUser && m.language && (
                        <span className="uppercase tracking-wider font-bold opacity-75">
                          [{m.language}]
                        </span>
                      )}
                    </div>

                    {!isUser && m.deep_link && (
                      <button
                        onClick={() => navigate(m.deep_link!)}
                        className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 hover:underline"
                      >
                        <span>Open Screen</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Verified Banking Facts Used (Expandable Card) */}
                {!isUser && hasVerifiedData && (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 text-xs overflow-hidden">
                    <button
                      onClick={() => toggleFacts(m.id)}
                      className="w-full flex items-center justify-between px-3 py-1.5 text-left text-[11px] font-bold text-emerald-800 hover:bg-emerald-100/60 transition"
                    >
                      <span className="flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                        Verified Data Grounding ({Object.keys(m.verified_data).length} parameters)
                      </span>
                      {isFactsExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>

                    {isFactsExpanded && (
                      <div className="p-3 border-t border-emerald-200 bg-white space-y-1.5 text-[11px] font-mono text-slate-700">
                        {Object.entries(m.verified_data).map(([k, v]) => (
                          <div key={k} className="flex items-center justify-between border-b border-slate-100 pb-1">
                            <span className="text-slate-500 font-sans">{k.replace(/_/g, ' ')}:</span>
                            <span className="font-bold text-slate-900">
                              {typeof v === 'number'
                                ? `₹${v.toLocaleString('en-IN')}`
                                : typeof v === 'object'
                                ? JSON.stringify(v)
                                : String(v)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Suggested Action Buttons */}
                {!isUser && m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {m.suggested_actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        disabled={loading}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 shadow-2xs hover:border-blue-300 transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <span>{action}</span>
                        <ArrowRight className="w-3 h-3 text-blue-500" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start items-start animate-in fade-in duration-150">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shrink-0 shadow-xs">
              <BotMessageSquare className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl rounded-bl-xs bg-slate-50 border border-slate-200 text-xs text-slate-600 shadow-xs space-y-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                <span className="font-semibold text-slate-800">FinPulse Gemini is analyzing verified banking facts...</span>
              </div>
              <div className="flex items-center gap-1.5 pl-1 pt-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2"
      >
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
            placeholder={
              language === 'gu'
                ? 'ગુજરાતીમાં લખો (જેમ કે: "મારી લોન EMI કેટલી છે?", "બેલેન્સ બતાવો")...'
                : language === 'hi'
                ? 'यहाँ पूछें (जैसे: "मेरा EMI कितना है?", "बैलेंस बताओ", "क्या मैं लोन ले सकता हूँ?")...'
                : 'Ask naturally (e.g. "What is my balance?", "Can I take a bike loan?", "Show loans")...'
            }
            className="w-full px-5 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-600 shadow-xs font-medium pr-10 disabled:bg-slate-50"
          />
          {inputText && (
            <button
              type="button"
              onClick={() => setInputText('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-6 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2 shrink-0"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

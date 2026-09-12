import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  ArrowRight,
  Banknote,
  Lightbulb,
  Calendar,
  Zap,
  Compass,
  Sun,
  Award,
  Clock,
  PieChart,
  HelpCircle,
  ShieldAlert,
  Trash2,
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
  proactive_insight?: string;
  coaching_advice?: {
    why_this_advice: string;
    expected_benefit: string;
  };
  suggested_actions?: string[];
  deep_link?: string;
  model_used?: string;
  timestamp?: string;
}

interface DailyBrief {
  greeting: string;
  customer_name: string;
  health_score: number;
  health_tier: string;
  highlights: string[];
  today_suggestion: string;
  quick_actions: string[];
  deep_link?: string;
}

export const ConversationalAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dailyBrief, setDailyBrief] = useState<DailyBrief | null>(null);
  const [briefCollapsed, setBriefCollapsed] = useState(false);
  const [expandedFacts, setExpandedFacts] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedPromptRef = useRef<string | null>(null);

  // Personalized Welcome Generator (Feature 9)
  const getPersonalizedWelcome = (brief?: DailyBrief | null): Message => {
    const firstName = user?.name ? user.name.split(' ')[0] : 'there';
    const score = brief?.health_score || 82;
    const tier = brief?.health_tier || 'GOOD';

    if (language === 'gu') {
      return {
        id: 'init_welcome',
        sender: 'ASSISTANT',
        content: `નમસ્તે ${firstName}ભાઈ 🌞\n\nતમારો નાણાકીય હેલ્થ સ્કોર: **${score}/100** (${tier})\n${
          brief?.today_suggestion || 'હું તમારા ખાતા બેલેન્સ, આગામી EMI, ખર્ચ વિશ્લેષણ અને બચત યોજનાઓ માટે તૈયાર છું.'
        }`,
        suggested_actions: brief?.quick_actions || [
          'મારું ખાતા બેલેન્સ કેટલું છે?',
          'મારી આગામી EMI તારીખ કઈ છે?',
          'આ અઠવાડિયે સૌથી વધુ ખર્ચ ક્યાં થયો?',
          'શ્રેષ્ઠ રોકાણ યોજના બતાવો',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    if (language === 'hi') {
      return {
        id: 'init_welcome',
        sender: 'ASSISTANT',
        content: `नमस्ते ${firstName} जी 🌞\n\nआपका वित्तीय स्वास्थ्य स्कोर: **${score}/100** (${tier})\n${
          brief?.today_suggestion || 'मैं आपके बैंक बैलेंस, आगामी किश्तों, मासिक खर्च और बचत कोचिंग के लिए तैयार हूँ।'
        }\n\nआज आप क्या जानना चाहते हैं?`,
        suggested_actions: brief?.quick_actions || [
          'मेरा वर्तमान बैलेंस कितना है?',
          'मेरी आगामी किश्त कब देय है?',
          'सर्वाधिक खर्च किस श्रेणी में हुआ?',
          'मेरे लिए सर्वश्रेष्ठ बचत योजना क्या है?',
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    return {
      id: 'init_welcome',
      sender: 'ASSISTANT',
      content: `Namaste ${firstName} 🌞\n\nFinancial Health Score: **${score}/100** (${tier})\n${
        brief?.today_suggestion || 'Great job managing your accounts! How can I assist with your finances today?'
      }\n\nAsk me anything about your balance, upcoming bills, spending breakdown, or smart savings opportunities.`,
      suggested_actions: brief?.quick_actions || [
        'What is my available balance?',
        'When is my next EMI due?',
        'Where did I spend the most this week?',
        'Suggest best investment for me',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  };

  // Load Daily AI Banking Brief (Feature 1) & Conversation History (Feature 8)
  useEffect(() => {
    const initializeChatbot = async () => {
      let loadedBrief: DailyBrief | null = null;
      try {
        const briefRes = await api.get('/chat/brief', { params: { lang: language } });
        if (briefRes.data?.success && briefRes.data.brief) {
          loadedBrief = briefRes.data.brief;
          setDailyBrief(loadedBrief);
        }
      } catch (err) {
        console.warn('Could not load daily brief:', err);
      }

      try {
        const historyRes = await api.get('/chat/history');
        if (historyRes.data?.success && Array.isArray(historyRes.data.history) && historyRes.data.history.length > 0) {
          const loaded: Message[] = historyRes.data.history.map((m: any) => ({
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
          setMessages([getPersonalizedWelcome(loadedBrief)]);
        }
      } catch (err) {
        setMessages([getPersonalizedWelcome(loadedBrief)]);
      }
    };

    initializeChatbot();
  }, [language]);

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

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      // Send message along with recent conversation history for multi-turn context (Feature 8)
      const res = await api.post('/chat', {
        message: text,
        language: language,
        history: newMessages.slice(-8).map((m) => ({
          sender: m.sender,
          content: m.content,
        })),
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
          proactive_insight: botData.proactive_insight,
          coaching_advice: botData.coaching_advice,
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

  // Handle incoming navigation prompt from LifeEventPredictionWidget or other deep-links
  useEffect(() => {
    const prompt = (location.state as any)?.prompt;
    if (prompt && processedPromptRef.current !== prompt) {
      processedPromptRef.current = prompt;
      const timer = setTimeout(() => {
        handleSendMessage(prompt);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const handleClearChat = async () => {
    try {
      await api.delete('/chat/history');
    } catch (err) {
      console.warn('Failed to clear chat history on server:', err);
    }
    setMessages([getPersonalizedWelcome(dailyBrief)]);
  };

  // Quick Action Exploration Pills
  const quickFeaturePills = [
    { label: '💰 How Am I Spending?', query: 'How am I spending this month? Please give me an AI spending coaching report.' },
    { label: '⚠️ Am I Overspending?', query: 'Am I overspending on food or shopping this month?' },
    { label: '📉 How to Save More?', query: 'How can I save more money? Give me practical budgeting advice.' },
    { label: '📅 Upcoming Payments', query: 'What are my upcoming payments, bills, and expected salary this month?' },
    { label: '🚀 Opportunity Detector', query: 'What investment or savings opportunities are recommended for my profile?' },
    { label: '🔄 Can I Reduce This EMI?', query: 'Can I reduce my loan EMI or restructure it?' },
    { label: '🎯 Upcoming Life Events', query: 'What life events have you detected for me and what should I prepare for next?' },
    { label: '🏡 Home Loan Readiness', query: 'Am I eligible for a home loan soon based on my rent and savings?' },
    { label: '🛡️ Why Insurance?', query: 'Why are you recommending insurance or emergency medical protection for me?' },
    { label: '🇮🇳 "Mera EMI kitna hai?"', query: 'Mera EMI kitna hai aur kab due hai?' },
    { label: '🇮🇳 "Maru balance ketlu che?"', query: 'Maru account balance ketlu che?' },
  ];

  return (
    <div className="max-w-4xl mx-auto gap-3 h-full flex flex-col animate-in fade-in duration-200 min-h-0">
      {/* Top Header Banner */}
      <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white flex items-center justify-center shadow-xs">
            <BotMessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-xs sm:text-sm">FinPulse AI Banking Copilot</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Zero Hallucination
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              Connected with Financial Twin, Verified Core Accounts, Loans, & Anti-Predatory Safety Gateway.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Vernacular Language Selector */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-semibold text-slate-600">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded-lg transition ${
                language === 'en' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded-lg transition ${
                language === 'hi' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => setLanguage('gu')}
              className={`px-2 py-1 rounded-lg transition ${
                language === 'gu' ? 'bg-white text-blue-700 shadow-2xs font-bold' : 'hover:text-slate-900'
              }`}
            >
              ગુજરાતી
            </button>
          </div>

          {dailyBrief && (
            <button
              onClick={() => setBriefCollapsed(!briefCollapsed)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Daily Brief</span>
              {briefCollapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
            </button>
          )}

          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-slate-200 transition"
          >
            <Trash2 className="w-3 h-3" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Feature 1: Daily AI Banking Brief Card (Customer Only) */}
      {dailyBrief && !briefCollapsed && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-emerald-50/50 border border-blue-200/90 shadow-xs space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-2xs text-xs">
                <Sun className="w-3.5 h-3.5 text-amber-300" />
              </span>
              <span className="font-bold text-xs sm:text-sm text-slate-900">{dailyBrief.greeting}</span>
              <span className="text-[11px] text-slate-500">• Today's AI Banking Brief</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white text-blue-800 border border-blue-200 shadow-2xs flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                Health: {dailyBrief.health_score}/100 ({dailyBrief.health_tier})
              </span>
              <button
                onClick={() => setBriefCollapsed(true)}
                className="text-slate-400 hover:text-slate-600 text-xs px-1"
                title="Minimize brief"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700 font-medium">
            {dailyBrief.highlights.map((bullet, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-white/80 p-2 rounded-xl border border-blue-100/60 shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                <span className="leading-snug">{bullet}</span>
              </div>
            ))}
          </div>

          {dailyBrief.today_suggestion && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-xs bg-white/90 p-2.5 rounded-xl border border-blue-100 shadow-2xs">
              <div className="flex items-center gap-2 text-blue-900 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>{dailyBrief.today_suggestion}</span>
              </div>
              {dailyBrief.deep_link && (
                <button
                  onClick={() => navigate(dailyBrief.deep_link!)}
                  className="px-3 py-1 rounded-lg text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shrink-0 shadow-2xs flex items-center gap-1 transition"
                >
                  <span>Explore Plan</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Suggested Quick Exploration Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none min-w-0 shrink-0">
        <span className="text-[11px] font-bold text-slate-500 shrink-0 flex items-center gap-1 pl-1">
          <Compass className="w-3.5 h-3.5 text-blue-600" />
          Ask:
        </span>
        {quickFeaturePills.map((pill, idx) => (
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

      {/* Chat Messages Container */}
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

                  {/* Feature 2: Smart Proactive Insight Badge */}
                  {!isUser && m.proactive_insight && (
                    <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-blue-500/10 border border-amber-300/90 shadow-2xs space-y-1 text-slate-800">
                      <div className="flex items-center gap-1.5 font-bold text-amber-900 text-xs">
                        <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Smart Proactive Insight</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pl-5 font-medium">{m.proactive_insight}</p>
                    </div>
                  )}

                  {/* Feature 3: AI Financial Coach Advice Card */}
                  {!isUser && m.coaching_advice && (
                    <div className="mt-3 p-3 rounded-xl bg-blue-50/80 border border-blue-200 shadow-2xs space-y-2 text-slate-800">
                      <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                        <TrendingUp className="w-4 h-4 text-blue-700 shrink-0" />
                        <span>AI Financial Coach Rationale</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl bg-white border border-blue-100 space-y-1">
                          <span className="font-bold text-slate-800 text-[11px] block">💡 Why this advice:</span>
                          <p className="text-slate-600 leading-snug text-[11px]">{m.coaching_advice.why_this_advice}</p>
                        </div>
                        <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200 space-y-1">
                          <span className="font-bold text-emerald-900 text-[11px] block">📈 Expected Benefit:</span>
                          <p className="text-emerald-800 leading-snug text-[11px] font-semibold">
                            {m.coaching_advice.expected_benefit}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Feature 4: Weekly Spending Summary Breakdown Card */}
                  {!isUser &&
                    (m.intent === 'SPENDING_COACH' || m.verified_data?.spending_coach) &&
                    m.verified_data?.spending_coach && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-purple-50/70 border border-indigo-200 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-indigo-900 text-xs">
                            <PieChart className="w-4 h-4 text-indigo-700 shrink-0" />
                            <span>Verified Spending Coach Report</span>
                          </div>
                          <button
                            onClick={() => navigate('/spending-coach')}
                            className="text-[11px] font-bold text-indigo-700 hover:text-indigo-900 flex items-center gap-1 hover:underline"
                          >
                            <span>Full Spending Coach</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                          <div className="p-2 rounded-xl bg-white border border-indigo-100">
                            <span className="text-[10px] text-slate-500 block">Total Spent</span>
                            <span className="font-bold text-slate-900">
                              ₹{(m.verified_data.spending_coach.total_monthly_spent || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-indigo-100">
                            <span className="text-[10px] text-slate-500 block">Highest Category</span>
                            <span className="font-bold text-red-700 truncate block">
                              {m.verified_data.spending_coach.highest_category}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ₹{(m.verified_data.spending_coach.highest_category_amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-indigo-100">
                            <span className="text-[10px] text-slate-500 block">Lowest Category</span>
                            <span className="font-bold text-emerald-700 truncate block">
                              {m.verified_data.spending_coach.lowest_category}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              ₹{(m.verified_data.spending_coach.lowest_category_amount || 0).toLocaleString('en-IN')}
                            </span>
                          </div>
                          <div className="p-2 rounded-xl bg-white border border-indigo-100">
                            <span className="text-[10px] text-slate-500 block">MoM Trend</span>
                            <span
                              className={`font-bold ${
                                m.verified_data.spending_coach.mom_change_pct > 0 ? 'text-amber-700' : 'text-emerald-700'
                              }`}
                            >
                              {m.verified_data.spending_coach.mom_change_pct > 0 ? '+' : ''}
                              {m.verified_data.spending_coach.mom_change_pct}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Feature 5: Upcoming Financial Events Timeline Card */}
                  {!isUser &&
                    (m.intent === 'UPCOMING_EVENTS' || m.verified_data?.timeline) &&
                    Array.isArray(m.verified_data?.timeline) &&
                    m.verified_data.timeline.length > 0 && (
                      <div className="mt-3 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50/80 via-white to-indigo-50/60 border border-blue-200 shadow-2xs space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 font-bold text-blue-900 text-xs">
                            <Calendar className="w-4 h-4 text-blue-700 shrink-0" />
                            <span>Verified Financial Timeline (This Month)</span>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            {m.verified_data.timeline.length} Events
                          </span>
                        </div>

                        <div className="space-y-2">
                          {m.verified_data.timeline.map((ev: any, idx: number) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200/90 hover:border-blue-300 transition text-xs shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                                    ev.type === 'SALARY'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-blue-100 text-blue-800'
                                  }`}
                                >
                                  {ev.type === 'SALARY' ? (
                                    <Banknote className="w-4 h-4" />
                                  ) : (
                                    <Clock className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <div className="font-bold text-slate-900 leading-tight">{ev.title}</div>
                                  <div className="text-[11px] text-slate-500">
                                    {ev.date} • {ev.days_remaining > 0 ? `in ${ev.days_remaining} days` : 'today'}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div
                                  className={`font-bold ${
                                    ev.type === 'SALARY' ? 'text-emerald-700' : 'text-slate-900'
                                  }`}
                                >
                                  {ev.type === 'SALARY' ? '+' : '-'}₹{(ev.amount || 0).toLocaleString('en-IN')}
                                </div>
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${
                                    ev.status === 'COMPLETED'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}
                                >
                                  {ev.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* Feature 6 & 10: Opportunity Detector Cards (with Safety Shield & Don't Sell Me Mode) */}
                  {!isUser && (m.intent === 'OPPORTUNITY_DETECTOR' || m.verified_data?.opportunities) && (
                    <div className="mt-3 space-y-2.5">
                      {m.verified_data?.dont_sell_me_active ? (
                        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-300 text-xs space-y-2">
                          <div className="flex items-center gap-2 font-bold text-amber-900">
                            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>FinPulse Ethical Safety Shield Active (Don't Sell Me Mode)</span>
                          </div>
                          <p className="text-slate-700 text-[11px] leading-relaxed">
                            {m.verified_data.message ||
                              'Because your Financial Stress Index indicates elevated EMI obligations, our anti-predatory engine has blocked unsolicited loan offers. Instead, here are debt restructuring and budget relief options:'}
                          </p>
                          <div className="flex flex-wrap gap-2 pt-1">
                            <button
                              onClick={() => navigate('/what-if')}
                              className="px-3 py-1.5 rounded-xl bg-blue-700 text-white font-bold text-xs hover:bg-blue-800 shadow-2xs flex items-center gap-1"
                            >
                              <span>FinPulse Samadhan Relief Plan</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ) : Array.isArray(m.verified_data?.opportunities) && m.verified_data.opportunities.length > 0 ? (
                        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/60 border border-emerald-200 shadow-2xs space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 font-bold text-emerald-900 text-xs">
                              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>AI Opportunity Detector</span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              {m.verified_data.opportunities.length} Matched
                            </span>
                          </div>

                          <div className="space-y-2">
                            {m.verified_data.opportunities.map((opp: any, oIdx: number) => (
                              <div
                                key={oIdx}
                                className="p-3 rounded-xl bg-white border border-emerald-100 hover:border-emerald-300 transition text-xs space-y-2 shadow-2xs"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-slate-900 text-xs">{opp.product_name}</div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                      {opp.product_type}
                                    </span>
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                                    {opp.match_score}% Match
                                  </span>
                                </div>

                                {/* Explicit "Why you're seeing this recommendation" */}
                                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/80 text-[11px] text-slate-800 space-y-0.5">
                                  <div className="flex items-center gap-1 font-bold text-emerald-900 text-[10px]">
                                    <HelpCircle className="w-3 h-3 text-emerald-700" />
                                    <span>Why you're seeing this recommendation:</span>
                                  </div>
                                  <p className="text-slate-700 pl-4">{opp.why_recommendation}</p>
                                  {opp.expected_benefit && (
                                    <p className="text-emerald-800 font-semibold pl-4">
                                      ✨ Benefit: {opp.expected_benefit}
                                    </p>
                                  )}
                                </div>

                                <div className="flex justify-end pt-1">
                                  <button
                                    onClick={() => navigate('/recommendations')}
                                    className="px-3 py-1 rounded-lg text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs flex items-center gap-1 transition"
                                  >
                                    <span>Explore Plan</span>
                                    <ArrowRight className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}

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

                {/* Feature 7: Dynamic Context-Aware Follow-Up Suggestions */}
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

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex gap-2 shrink-0"
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
                ? 'ગુજરાતીમાં લખો (જેમ કે: "ખર્ચ રિપોર્ટ બતાવો", "આગામી EMI ક્યારે છે?")...'
                : language === 'hi'
                ? 'यहाँ पूछें (जैसे: "साप्ताहिक खर्च कहाँ हुआ?", "आगामी किश्तें दिखाओ", "बचत कैसे बढ़ाएं?")...'
                : 'Ask naturally (e.g. "Where did I spend the most?", "Upcoming payments", "How to save more?")...'
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

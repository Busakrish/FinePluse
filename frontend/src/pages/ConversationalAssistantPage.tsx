import React, { useState, useEffect, useRef } from 'react';
import { BotMessageSquare, Send, User, Sparkles, CheckCircle, Languages, ShieldCheck } from 'lucide-react';
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
}

export const ConversationalAssistantPage: React.FC = () => {
  const { user } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init_1',
      sender: 'ASSISTANT',
      content: language === 'gu'
        ? 'નમસ્તે! હું તમારો FinPulse AI બેંકિંગ સહાયક છું. તમે મને ગુજરાતીમાં તમારા ખાતાનું બેલેન્સ, EMI અથવા બચત વિષે પૂછી શકો છો.'
        : language === 'hi'
        ? 'नमस्ते! मैं आपका FinPulse AI बैंकिंग सहायक हूँ। आप मुझसे हिंदी में खाते की शेष राशि, किश्त (EMI) या बचत योजनाओं के बारे में पूछ सकते हैं।'
        : 'Namaste! I am your FinPulse AI assistant for Bharat. Ask me anything about your balance, active EMIs, loan affordability, or savings advice in English, Hindi, or Gujarati.',
      suggested_actions: language === 'gu'
        ? ['મારી EMI કેટલી છે?', 'મારું બેલેન્સ કેટલું છે?', 'નાણાકીય સ્વાસ્થ્ય સ્કોર']
        : language === 'hi'
        ? ['मेरी EMI कितनी है?', 'मेरा बैलेंस कितना है?', 'वित्तीय स्वास्थ्य स्कोर']
        : ['What is my active EMI?', 'Check my account balance', 'How can I increase my savings?'],
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'USER',
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await api.post('/chat', {
        message: text,
        language: language,
      });

      if (res.data.success) {
        const botMsg: Message = {
          id: `a_${Date.now()}`,
          sender: 'ASSISTANT',
          content: res.data.response.message,
          language: res.data.response.language,
          intent: res.data.response.intent,
          verified_data: res.data.response.verified_data,
          suggested_actions: res.data.response.suggested_actions,
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          sender: 'ASSISTANT',
          content: 'Sorry, I could not process your query right now. Please try again.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const vernacularPills = [
    { label: '🇬🇧 English: "What is my EMI?"', query: 'What is my active EMI?' },
    { label: '🇮🇳 Hindi: "Mera EMI kitna hai?"', query: 'Mera EMI kitna hai?' },
    { label: '🇮🇳 Gujarati: "Mare loan ni details joi che."', query: 'Mare loan ni details joi che.' },
    { label: '🇮🇳 Hindi: "Mujhe apni savings badhani hai."', query: 'Mujhe apni savings badhani hai.' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-4 h-[calc(100vh-120px)] flex flex-col animate-in fade-in duration-200">
      {/* Top Banner: Verified Backend Pipeline Badge */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs">
        <div className="flex items-center gap-2 text-indigo-200">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Verified Banking Intelligence:</strong> AI responses use verified core backend balances & EMI data. Zero hallucinations.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
          Demo AI Mode Active
        </span>
      </div>

      {/* Suggested Multilingual Prompt Pills (Section 13) */}
      <div className="flex flex-wrap gap-2">
        {vernacularPills.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 glass-panel p-4 sm:p-6 rounded-3xl overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.sender === 'USER';
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-600/30">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-lg'
                      : 'bg-slate-800/90 border border-slate-700 text-slate-100 rounded-bl-none shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* Factual Backend Verified Tag */}
                  {!isUser && m.intent && m.intent !== 'UNKNOWN' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      <span>Verified Intent: {m.intent}</span>
                    </div>
                  )}
                </div>

                {/* Suggested Action Pills */}
                {!isUser && m.suggested_actions && m.suggested_actions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggested_actions.map((action, aIdx) => (
                      <button
                        key={aIdx}
                        onClick={() => handleSendMessage(action)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/20 transition"
                      >
                        {action} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-700 text-white flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 w-fit">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>FinPulse AI is analyzing verified data in {language === 'gu' ? 'Gujarati' : language === 'hi' ? 'Hindi' : 'English'}...</span>
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
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            language === 'gu'
              ? 'ગુજરાતીમાં લખો (જેમ કે: મારી લોનની વિગતો બતાવો...)'
              : language === 'hi'
              ? 'यहाँ लिखें (जैसे: मेरा बैलेंस कितना है?...)'
              : 'Ask in English, Hindi ("Mera EMI"), or Gujarati ("Maru balance")...'
          }
          className="flex-1 px-5 py-3.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500 shadow-xl"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

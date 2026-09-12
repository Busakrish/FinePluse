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
      <div className="flex items-center justify-between p-4 rounded-2xl bg-blue-50 border border-blue-200 text-xs shadow-xs">
        <div className="flex items-center gap-2.5 text-blue-900 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong className="text-blue-950">Verified Banking Assistant (Engine 5):</strong> Multilingual vernacular AI powered by verified core banking records. Zero hallucinations.
          </span>
        </div>
        <span className="hidden sm:inline-block px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
          Deterministic Verified Facts
        </span>
      </div>

      {/* Suggested Multilingual Prompt Pills (Section 13) */}
      <div className="flex flex-wrap gap-2">
        {vernacularPills.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p.query)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 shadow-xs transition"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 bg-white border border-slate-200 p-4 sm:p-6 rounded-3xl overflow-y-auto space-y-4 shadow-xs">
        {messages.map((m) => {
          const isUser = m.sender === 'USER';
          return (
            <div key={m.id} className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div className={`space-y-2 max-w-[85%] sm:max-w-[75%]`}>
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-700 text-white rounded-br-none shadow-xs font-medium'
                      : 'bg-slate-50 border border-slate-200 text-slate-900 rounded-bl-none shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>

                  {/* Factual Backend Verified Tag */}
                  {!isUser && m.intent && m.intent !== 'UNKNOWN' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold">
                      <CheckCircle className="w-3.5 h-3.5" />
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
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 shadow-xs transition"
                      >
                        {action} →
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 w-fit shadow-xs">
            <Sparkles className="w-4 h-4 text-blue-600 animate-spin" />
            <span>FinPulse AI is analyzing verified core data in {language === 'gu' ? 'Gujarati' : language === 'hi' ? 'Hindi' : 'English'}...</span>
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
          className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-slate-300 text-slate-900 text-xs sm:text-sm focus:outline-none focus:border-blue-600 shadow-xs font-medium"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="px-6 py-3.5 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};

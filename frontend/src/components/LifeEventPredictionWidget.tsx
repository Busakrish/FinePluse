import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Briefcase,
  Home,
  HeartHandshake,
  GraduationCap,
  HeartPulse,
  Car,
  Plane,
  AlertTriangle,
  LifeBuoy,
  Lock,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  BotMessageSquare,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api';
import { LifeEventPrediction, LifeEventCategory } from '../types';

interface LifeEventPredictionWidgetProps {
  className?: string;
}

export const LifeEventPredictionWidget: React.FC<LifeEventPredictionWidgetProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [predictions, setPredictions] = useState<LifeEventPrediction[]>([]);
  const [consentRestricted, setConsentRestricted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLifeEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get('/life-events');
        if (!isMounted) return;

        if (res.data?.success) {
          setPredictions(res.data.predictions || []);
          setConsentRestricted(Boolean(res.data.consent_restricted));
        } else {
          setError('Unable to load life event predictions');
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn('Failed to fetch life event predictions:', err);
        setError('Connection error loading life events');
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchLifeEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryConfig = (category: LifeEventCategory) => {
    switch (category) {
      case 'CAREER':
        return {
          icon: Briefcase,
          accentBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          badgeBg: 'bg-emerald-100 text-emerald-800',
          borderLeft: 'border-l-emerald-600',
        };
      case 'HOUSING':
        return {
          icon: Home,
          accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-800',
          borderLeft: 'border-l-blue-600',
        };
      case 'FAMILY':
        return {
          icon: HeartHandshake,
          accentBg: 'bg-pink-50 text-pink-700 border-pink-200',
          badgeBg: 'bg-pink-100 text-pink-800',
          borderLeft: 'border-l-pink-600',
        };
      case 'EDUCATION':
        return {
          icon: GraduationCap,
          accentBg: 'bg-purple-50 text-purple-700 border-purple-200',
          badgeBg: 'bg-purple-100 text-purple-800',
          borderLeft: 'border-l-purple-600',
        };
      case 'HEALTH':
        return {
          icon: HeartPulse,
          accentBg: 'bg-rose-50 text-rose-700 border-rose-200',
          badgeBg: 'bg-rose-100 text-rose-800',
          borderLeft: 'border-l-rose-600',
        };
      case 'VEHICLE':
        return {
          icon: Car,
          accentBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
          badgeBg: 'bg-cyan-100 text-cyan-800',
          borderLeft: 'border-l-cyan-600',
        };
      case 'TRAVEL':
        return {
          icon: Plane,
          accentBg: 'bg-amber-50 text-amber-700 border-amber-200',
          badgeBg: 'bg-amber-100 text-amber-800',
          borderLeft: 'border-l-amber-600',
        };
      case 'STRESS_RELIEF':
        return {
          icon: LifeBuoy,
          accentBg: 'bg-amber-50 text-amber-800 border-amber-300',
          badgeBg: 'bg-amber-100 text-amber-900',
          borderLeft: 'border-l-rose-600',
        };
      default:
        return {
          icon: Sparkles,
          accentBg: 'bg-blue-50 text-blue-700 border-blue-200',
          badgeBg: 'bg-blue-100 text-blue-800',
          borderLeft: 'border-l-blue-600',
        };
    }
  };

  const getConfidenceBadge = (confidence: 'HIGH' | 'MEDIUM' | 'LOW', score: number) => {
    switch (confidence) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            Confidence: High ({score}%)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            Confidence: Medium ({score}%)
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-slate-100 text-slate-700 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            Confidence: Low ({score}%)
          </span>
        );
    }
  };

  const handleActionClick = (prediction: LifeEventPrediction) => {
    if (prediction.action.route === '/assistant') {
      navigate('/assistant', {
        state: { prompt: prediction.action.query_prompt },
      });
    } else {
      navigate(prediction.action.route);
    }
  };

  const handleAskChatbot = (prediction: LifeEventPrediction) => {
    navigate('/assistant', {
      state: { prompt: prediction.action.query_prompt || `Tell me more about the detected milestone: ${prediction.title}` },
    });
  };

  if (loading) {
    return (
      <div className={`bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-100 animate-pulse" />
            <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-44 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <section className={`space-y-4 ${className}`} aria-labelledby="life-events-heading">
      {/* Header section with AI badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
              FinPulse AI Engine
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Milestone Intelligence</span>
          </div>
          <h2 id="life-events-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            Upcoming Financial Life Events
          </h2>
          <p className="text-xs text-slate-500">
            Proactively detected from your verified banking transactions and cash flow patterns. Zero ads, strictly explainable recommendations.
          </p>
        </div>

        <button
          onClick={() => navigate('/assistant', { state: { prompt: 'What financial life events have you detected for me?' } })}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition shrink-0 self-start sm:self-auto"
        >
          <BotMessageSquare className="w-3.5 h-3.5" />
          <span>Ask AI in Chat</span>
        </button>
      </div>

      {/* Case 1: DPDPA Consent Restricted State */}
      {consentRestricted ? (
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900">Life Event Predictions are Paused</h3>
                <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                  Under your <strong>DPDPA 2023 Consent Center</strong> preferences, <em>Personalized Recommendations</em> are currently disabled. FinPulse AI strictly respects your privacy and will not analyze your milestone patterns without your affirmative consent.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/consent')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shrink-0 shadow-xs transition"
            >
              <span>Manage Consent</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : predictions.length === 0 ? (
        /* Case 2: Empty State (No milestones detected) */
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-slate-50 text-slate-400 mb-1">
            <ShieldCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">No Major Life Milestones Detected Right Now</h3>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            Your cash flow is steady and balanced. FinPulse AI continuously watches for key transitions—such as salary increments, rent patterns, major medical expenses, or vehicle plans—and will alert you with timely recommendations when milestones occur.
          </p>
        </div>
      ) : (
        /* Case 3: Display Prediction Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {predictions.map((item) => {
            const config = getCategoryConfig(item.category);
            const IconComponent = config.icon;

            return (
              <div
                key={item.id}
                className={`bg-white border border-slate-200 border-l-4 ${config.borderLeft} p-5 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4`}
              >
                {/* Top: Event Icon, Title & Confidence */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-xl border ${config.accentBg} shrink-0`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded ${config.badgeBg}`}>
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-900 mt-0.5">{item.title}</h3>
                      </div>
                    </div>

                    {getConfidenceBadge(item.confidence, item.confidence_score)}
                  </div>

                  {/* Why FinPulse Detected This (AI Grounding) */}
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                      <HelpCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>Why FinPulse detected this:</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed pl-5">
                      {item.why_detected}
                    </p>

                    {/* Detected Signals tags */}
                    {item.detected_signals && item.detected_signals.length > 0 && (
                      <div className="pt-1.5 pl-5 flex flex-wrap gap-1.5">
                        {item.detected_signals.map((sig, sIdx) => (
                          <span
                            key={sIdx}
                            className="inline-flex items-center gap-1 text-[10px] font-medium bg-white text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                            {sig}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Personalized Recommendation */}
                  <div className="border border-blue-100 bg-blue-50/40 p-3 rounded-xl space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                        {item.recommendation.product_type}
                      </span>
                      <span className="text-[11px] font-bold text-blue-900">
                        {item.recommendation.title}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 leading-snug">
                      {item.recommendation.description}
                    </p>
                    <div className="text-[11px] text-emerald-700 font-semibold pt-1 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span>Expected Impact: {item.recommendation.benefit}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom: Contextual Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleActionClick(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all hover:scale-[1.01]"
                  >
                    <span>{item.action.label}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleAskChatbot(item)}
                    title="Ask AI Chatbot about this event"
                    className="p-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition shrink-0"
                    aria-label={`Ask FinPulse AI about ${item.title}`}
                  >
                    <BotMessageSquare className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

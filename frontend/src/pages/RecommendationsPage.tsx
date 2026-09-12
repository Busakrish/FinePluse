import React, { useState, useEffect } from 'react';
import { Sparkles, HelpCircle, ShieldAlert, ArrowRight, CheckCircle2, ShieldCheck, Lock } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Recommendation } from '../types';
import { ExplainModal } from '../components/ExplainModal';

export const RecommendationsPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [suppressed, setSuppressed] = useState<Recommendation[]>([]);
  const [selectedRecForExplain, setSelectedRecForExplain] = useState<Recommendation | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/recommendations');
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
        setSuppressed(res.data.suppressed_recommendations);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 text-white shadow-lg shadow-indigo-600/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Hyper-Personalized Recommendation Engine (Engine 2)</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Explainable, RBI-aligned recommendations matched to your cashflow and verified financial health.
            </p>
          </div>
        </div>
      </div>

      {/* Active Recommended Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Active Personalized Opportunities ({recommendations.length})
          </h3>
          <span className="text-xs text-slate-400">Filtered via Responsible AI Safety Gateway</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center space-y-2 text-slate-400 text-xs">
            <ShieldCheck className="w-10 h-10 text-amber-400 mx-auto opacity-75" />
            <div className="font-bold text-slate-200 text-sm">Commercial Offers Are Paused</div>
            <p>Your profile is currently under defensive protection mode. We prioritize financial stability over selling products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {rec.product_type}
                      </span>
                      <span className="text-xs font-bold text-emerald-400">{rec.confidence_score}% Confidence</span>
                    </div>

                    <button
                      onClick={() => setSelectedRecForExplain(rec)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 transition shrink-0"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t('why_am_i_seeing_this')}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{rec.product_name}</h4>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{rec.what_is_recommended}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-300">
                    <strong className="text-slate-200">Customer Benefit:</strong> {rec.benefit_description}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">Risk Profile: <strong className="text-emerald-400">{rec.risk_level}</strong></span>
                  <button
                    onClick={() => setSelectedRecForExplain(rec)}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>View Explainability</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Suppressed Recommendations (Safety Gateway Intercepts - Demonstrating Responsible AI) */}
      {suppressed.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="text-sm font-bold text-amber-200">
                Suppressed Offers: Safety Gateway Active Intercepts ({suppressed.length})
              </h3>
              <p className="text-xs text-slate-400">Commercial loan cross-sells automatically blocked by anti-predatory nudging policies</p>
            </div>
          </div>

          <div className="space-y-3">
            {suppressed.map((sup) => (
              <div key={sup.id} className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/40 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        BLOCKED BY POLICY
                      </span>
                      <h4 className="text-sm font-bold text-slate-300 line-through">{sup.product_name}</h4>
                    </div>
                    <p className="text-xs text-amber-300/90 mt-1.5 font-medium leading-relaxed">
                      {sup.block_reason}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedRecForExplain(sup)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition shrink-0"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>View Policy Rule</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainable AI Modal */}
      <ExplainModal
        isOpen={!!selectedRecForExplain}
        onClose={() => setSelectedRecForExplain(null)}
        recommendation={selectedRecForExplain}
      />
    </div>
  );
};

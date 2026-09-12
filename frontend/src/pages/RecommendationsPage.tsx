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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                AI Engine 2 • Product Personalization
              </span>
              <span className="text-xs text-blue-200">RBI Fair Lending Compliant</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Hyper-Personalized Banking Engine</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 leading-relaxed">
              Explainable, customer-first recommendations matched precisely to your monthly surplus and cashflow cushion — screened strictly against predatory borrowing.
            </p>
          </div>
        </div>
      </div>

      {/* Active Recommended Products Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Active Personalized Opportunities ({recommendations.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Screened by Responsible AI Safety Gateway</span>
        </div>

        {recommendations.length === 0 ? (
          <div className="bg-white border border-slate-200 p-8 rounded-3xl text-center space-y-2 text-slate-500 text-xs shadow-xs">
            <ShieldCheck className="w-10 h-10 text-amber-500 mx-auto" />
            <div className="font-bold text-slate-900 text-sm">Commercial Offers Are Paused</div>
            <p className="max-w-md mx-auto">Your account is currently under defensive protection mode. We prioritize your financial health over cross-selling credit products.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div key={rec.id} className="glass-panel-interactive p-6 rounded-3xl flex flex-col justify-between space-y-4 shadow-xs">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        {rec.product_type}
                      </span>
                      <span className="text-xs font-bold text-emerald-700">{rec.confidence_score}% Confidence</span>
                    </div>

                    <button
                      onClick={() => setSelectedRecForExplain(rec)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 transition shrink-0"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t('why_am_i_seeing_this')}</span>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">{rec.product_name}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.what_is_recommended}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                    <strong className="text-slate-900 font-bold">Customer Benefit:</strong> {rec.benefit_description}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">Risk Profile: <strong className="text-emerald-700">{rec.risk_level}</strong></span>
                  <button
                    onClick={() => setSelectedRecForExplain(rec)}
                    className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800"
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
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Suppressed Offers: Safety Gateway Active Intercepts ({suppressed.length})
              </h3>
              <p className="text-xs text-slate-500 font-medium">Commercial loan cross-sells automatically blocked by anti-predatory nudging policies</p>
            </div>
          </div>

          <div className="space-y-3">
            {suppressed.map((sup) => (
              <div key={sup.id} className="p-5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3 shadow-xs">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-900 border border-amber-300">
                        BLOCKED BY POLICY
                      </span>
                      <h4 className="text-sm font-bold text-slate-600 line-through">{sup.product_name}</h4>
                    </div>
                    <p className="text-xs text-amber-950 mt-1.5 font-medium leading-relaxed">
                      {sup.block_reason}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedRecForExplain(sup)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition shrink-0 shadow-xs"
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

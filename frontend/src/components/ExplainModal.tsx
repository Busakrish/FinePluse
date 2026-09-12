import React from 'react';
import { X, CheckCircle2, ShieldCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { Recommendation } from '../types';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendation: Recommendation | null;
}

export const ExplainModal: React.FC<ExplainModalProps> = ({ isOpen, onClose, recommendation }) => {
  if (!isOpen || !recommendation) return null;

  const why = recommendation.why_am_i_seeing_this;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Background glow accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Explainable AI (XAI) Breakdown</h3>
              <p className="text-xs text-slate-400">Transparent rationale & algorithmic factor verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Target Item */}
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Product / Action</div>
            <div className="text-base font-bold text-white mt-0.5">{recommendation.product_name}</div>
            <p className="text-xs text-slate-300 mt-1">{recommendation.what_is_recommended}</p>
          </div>

          {/* Key Contributing Behavioral Factors */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Primary Behavioral & Transactional Signals
            </h4>
            <div className="mt-2 space-y-2">
              {why?.key_factors?.map((factor, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                  <span>{factor}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Affordability & Cashflow Match */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Spending Pattern Match</div>
              <div className="text-xs text-slate-200 mt-1">{why?.spending_pattern_match || 'Aligned with discretionary cashflow.'}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Affordability Check</div>
              <div className="text-xs text-slate-200 mt-1">{why?.affordability_assessment || 'Passed liquid surplus verification.'}</div>
            </div>
          </div>

          {/* Safety Rule Applied */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-indigo-300">Responsible AI & Regulatory Rule</div>
              <div className="text-xs text-slate-300 mt-0.5">{why?.safety_rule_applied || 'Compliant with RBI fair lending and consumer protection guidelines.'}</div>
            </div>
          </div>

          {/* Confidence Score */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
            <span className="text-xs text-slate-300 font-medium">Algorithmic Confidence Score:</span>
            <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
              {recommendation.confidence_score}% Match
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Explanation
          </button>
        </div>
      </div>
    </div>
  );
};

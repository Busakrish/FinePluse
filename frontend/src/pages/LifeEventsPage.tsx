import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, Compass, Info } from 'lucide-react';
import { LifeEventPredictionWidget } from '../components/LifeEventPredictionWidget';

export const LifeEventsPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-700 transition">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Life Event Prediction AI</span>
          </nav>
          <div className="flex items-center gap-2.5 pt-1">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  Life Event Prediction AI
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  Engine 3
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Proactive milestone detection that prepares financial cushions and timely solutions before major life events occur.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Zero Hallucination Grounded</span>
          </div>
        </div>
      </div>

      {/* Main Full-Featured Life Event Prediction Experience */}
      <LifeEventPredictionWidget />

      {/* Explanatory Policy & Methodology Footer */}
      <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">
            How FinPulse AI Detects Life Events Responsibly
          </p>
          <p>
            Milestone predictions are generated deterministically by analyzing real transaction cadence, savings accumulation rate, salary growth, and stability ratios from your Financial Twin. Predictions are strictly governed by your <strong>DPDPA 2023 Consent</strong> preferences and anti-predatory fair lending guardrails.
          </p>
        </div>
      </div>
    </div>
  );
};

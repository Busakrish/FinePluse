import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck, PieChart, Info } from 'lucide-react';
import { SpendingCoachWidget } from '../components/SpendingCoachWidget';

export const SpendingCoachPage: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Breadcrumbs & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80">
        <div className="space-y-1.5">
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
            <Link to="/" className="hover:text-blue-700 transition">Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">AI Spending Coach</span>
          </nav>
          <div className="flex items-center gap-2.5 pt-1">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                  AI Spending Coach
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">
                  Priority 3 AI
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Real-time cashflow diagnostics, overspending alerts, burn-rate projections, and actionable habit coaching.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Banking Logic</span>
          </div>
        </div>
      </div>

      {/* Main Full-Featured Spending Coach Experience */}
      <SpendingCoachWidget />

      {/* Explanatory Policy & Methodology Footer */}
      <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl flex items-start gap-3.5 text-xs text-slate-600 leading-relaxed">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-slate-800">
            Privacy & Fair Lending Commitments
          </p>
          <p>
            The Spending Coach analyzes your verified UPI and net-banking transactions to provide personalized budgeting tips, month-over-month variances, and savings opportunities. <strong>FinPulse AI will NEVER pitch loans or credit cards to customers experiencing financial stress.</strong> You can pause or manage transaction analysis anytime in the <Link to="/consent" className="text-blue-700 font-bold hover:underline">DPDPA Consent Center</Link>.
          </p>
        </div>
      </div>
    </div>
  );
};

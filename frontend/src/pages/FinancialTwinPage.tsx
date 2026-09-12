import React, { useState, useEffect } from 'react';
import { Cpu, RefreshCw, Activity, ShieldCheck, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FinancialTwin } from '../types';

export const FinancialTwinPage: React.FC = () => {
  const { user } = useAuth();
  const [twin, setTwin] = useState<FinancialTwin | null>(null);
  const [behavioral, setBehavioral] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTwin = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/financial-twin');
      if (res.data.success) {
        setTwin(res.data.financial_twin);
        setBehavioral(res.data.behavioral_details);
      }
    } catch (err) {
      console.error('Failed to load twin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTwin();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-lg shadow-indigo-600/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">AI Financial Twin (Section 15)</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Real-Time Representation
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Central dynamic customer representation continuously updated across payment, loan, and behavioral events.
              </p>
            </div>
          </div>

          <button
            onClick={fetchTwin}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Twin</span>
          </button>
        </div>
      </div>

      {/* Twin Data Layer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Behavioral Segment</div>
          <div className="text-lg font-black text-white">{twin?.behavioral_segment || 'DISCIPLINED_SAVER'}</div>
          <div className="text-[11px] text-slate-400">Classified based on savings ratio & debt discipline.</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Savings Growth Trajectory</div>
          <div className={`text-lg font-black ${(twin?.savings_growth_rate || 0) < 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {(twin?.savings_growth_rate || 0) >= 0 ? '+' : ''}{twin?.savings_growth_rate}%
          </div>
          <div className="text-[11px] text-slate-400">Month-over-month net surplus movement.</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl space-y-2">
          <div className="text-xs font-bold text-slate-400 uppercase">Income Stability Score</div>
          <div className="text-lg font-black text-cyan-400">{behavioral?.income_stability_score || 90}/100</div>
          <div className="text-[11px] text-slate-400">Regularity of payroll & agricultural credits.</div>
        </div>
      </div>

      {/* Key Cashflow Breakdown */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Dynamic Cashflow Architecture</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Inflow</span>
            <div className="text-base font-bold text-white mt-1">₹{twin?.monthly_income.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Monthly Outflow</span>
            <div className="text-base font-bold text-slate-200 mt-1">₹{twin?.monthly_expenses.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">EMI Commitments</span>
            <div className="text-base font-bold text-amber-400 mt-1">₹{twin?.monthly_emi_burden.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Net Retained Savings</span>
            <div className="text-base font-bold text-emerald-400 mt-1">₹{twin?.monthly_savings.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Behavioral Insights Stream */}
      <div className="glass-panel p-6 rounded-3xl space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Behavioral Signals Detected (Engine 1)</h3>
        <div className="space-y-2">
          {behavioral?.insights?.map((ins: string, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-800 text-xs text-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

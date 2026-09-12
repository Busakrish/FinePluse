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
      {/* Purpose Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                AI Engine 1 • Behavioral Intelligence
              </span>
              <span className="text-xs text-blue-200">Real-Time Representation</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">AI Financial Twin (Section 15)</h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              Your Financial Twin is a dynamic digital replica of your income, essential spending, and liquid surplus. It analyzes transaction velocity across UPI and banking channels to safeguard your cashflow in real time.
            </p>
          </div>

          <button
            onClick={fetchTwin}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-blue-900 hover:bg-blue-50 shadow-sm transition shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Twin Data</span>
          </button>
        </div>
      </div>

      {/* How it works 3-step explainer */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">1</div>
          <div>
            <div className="text-xs font-bold text-slate-900">Ingests Account Signals</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Captures UPI transactions, salary credits, and bill payments.</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">2</div>
          <div>
            <div className="text-xs font-bold text-slate-900">Calculates Safe Capacity</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Measures debt burden, discretionary ratios, and liquid runway.</p>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">3</div>
          <div>
            <div className="text-xs font-bold text-slate-900">Enforces Protective Policies</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Suppresses cross-selling when stress rises above safety limits.</p>
          </div>
        </div>
      </div>

      {/* Twin Data Layer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 border-l-4 border-l-blue-600 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Behavioral Segment</div>
          <div className="text-xl font-black text-slate-900">{twin?.behavioral_segment || 'DISCIPLINED_SAVER'}</div>
          <div className="text-[11px] text-slate-500 font-medium">Classified based on savings ratio & debt discipline.</div>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Savings Growth Trajectory</div>
          <div className={`text-xl font-black ${(twin?.savings_growth_rate || 0) < 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {(twin?.savings_growth_rate || 0) >= 0 ? '+' : ''}{twin?.savings_growth_rate}%
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Month-over-month net surplus movement.</div>
        </div>

        <div className="bg-white border border-slate-200 border-l-4 border-l-cyan-600 p-5 rounded-2xl shadow-xs space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase">Income Stability Score</div>
          <div className="text-xl font-black text-blue-700">{behavioral?.income_stability_score || 90}/100</div>
          <div className="text-[11px] text-slate-500 font-medium">Regularity of payroll & agricultural credits.</div>
        </div>
      </div>

      {/* Key Cashflow Breakdown */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Dynamic Cashflow Architecture</h3>
          <span className="text-xs text-slate-500 font-medium">Updated every 60 seconds</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Inflow</span>
            <div className="text-lg font-black text-slate-900 mt-1">₹{twin?.monthly_income.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 uppercase font-bold">Monthly Outflow</span>
            <div className="text-lg font-black text-slate-800 mt-1">₹{twin?.monthly_expenses.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200">
            <span className="text-[10px] text-amber-800 uppercase font-bold">EMI Commitments</span>
            <div className="text-lg font-black text-amber-900 mt-1">₹{twin?.monthly_emi_burden.toLocaleString('en-IN')}</div>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-[10px] text-emerald-800 uppercase font-bold">Net Retained Savings</span>
            <div className="text-lg font-black text-emerald-800 mt-1">₹{twin?.monthly_savings.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Behavioral Insights Stream */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-3 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Behavioral Signals Detected (Engine 1)</h3>
        <div className="space-y-2">
          {behavioral?.insights?.map((ins: string, idx: number) => (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{ins}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

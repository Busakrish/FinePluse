import React, { useState, useEffect } from 'react';
import { Activity, ShieldCheck, TrendingUp, AlertTriangle, Target, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const FinancialHealthPage: React.FC = () => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/financial-health');
      if (res.data.success) {
        setHealthData(res.data);
      }
    } catch (err) {
      console.error('Failed to load financial health:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [user]);

  const score = healthData?.score || 70;
  const tier = healthData?.tier || 'GOOD';

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                AI Health Metric
              </span>
              <span className="text-xs text-blue-200">Deterministic Model (Section 16)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Deterministic Financial Health Index</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 leading-relaxed">
              A transparent, multi-factor banking score evaluating savings discipline, liquidity resilience, and debt burden without randomness or hidden bias.
            </p>
          </div>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-blue-500/20 bg-blue-50/50 shadow-sm">
            <div className="text-center">
              <span className="text-4xl font-black text-slate-900">{score}</span>
              <span className="text-xs text-slate-500 block font-bold">/ 100</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Health Rating</div>
            <h3 className="text-2xl font-black text-slate-900">{tier}</h3>
            <p className="text-xs text-slate-600 font-medium">
              Stress Factor: <strong className="text-amber-800">{healthData?.stress_level || 'LOW'}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-600 max-w-sm w-full">
          <div className="font-bold text-slate-900 mb-1">Scoring Pillars:</div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span>Savings Discipline:</span>
            <span className="font-bold text-emerald-700">{healthData?.savings_ratio}% ratio (Target &gt;20%)</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-slate-100">
            <span>Debt-to-Income Safety:</span>
            <span className="font-bold text-amber-800">{healthData?.emi_to_income_ratio}% burden (Safe &lt;40%)</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span>Growth Trajectory:</span>
            <span className="font-bold text-blue-700">{healthData?.savings_growth_rate}% YoY</span>
          </div>
        </div>
      </div>

      {/* Benchmarks Guide */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-xs bg-emerald-50/30">
          <div className="text-xs font-bold text-emerald-800 uppercase">80 - 100 • Prime Health</div>
          <p className="text-[11px] text-emerald-900 mt-1">High liquidity & low debt. Unlocks maximum investment rewards & prime interest concessions.</p>
        </div>
        <div className="bg-white border border-blue-200 p-4 rounded-2xl shadow-xs bg-blue-50/30">
          <div className="text-xs font-bold text-blue-800 uppercase">60 - 79 • Stable Buffer</div>
          <p className="text-[11px] text-blue-900 mt-1">Balanced cashflow. Recommended to reinforce a 3-month emergency liquid reserve.</p>
        </div>
        <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-xs bg-amber-50/30">
          <div className="text-xs font-bold text-amber-800 uppercase">&lt; 60 • Defensive Mode</div>
          <p className="text-[11px] text-amber-900 mt-1">High debt or declining savings. Automatically activates Don't Sell Me mode to prevent borrowing traps.</p>
        </div>
      </div>

      {/* Health Improvement Roadmap */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-blue-700" />
          Personalized Financial Health Roadmap
        </h3>

        <div className="space-y-2.5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Automate Emergency Reserve Allocation</div>
              <div className="text-slate-600 mt-0.5">Route 10% of monthly salary into a liquid deposit to build a 3-month safety moat (+6 health points).</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-slate-900">Maintain Debt-to-Income below 35%</div>
              <div className="text-slate-600 mt-0.5">Avoid high-interest consumer credit cards to protect long-term creditworthiness.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

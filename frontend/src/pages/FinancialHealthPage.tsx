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
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Deterministic Financial Health Index (Section 16)</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Transparent, multi-factor score evaluating savings discipline, liquidity resilience, and debt burden without randomness.
            </p>
          </div>
        </div>
      </div>

      {/* Main Score Card */}
      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-indigo-500/30 bg-slate-800/80 shadow-2xl">
            <div className="text-center">
              <span className="text-3xl font-black text-white">{score}</span>
              <span className="text-xs text-slate-400 block font-bold">/ 100</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Rating</div>
            <h3 className="text-2xl font-extrabold text-white">{tier}</h3>
            <p className="text-xs text-slate-300">
              Stress Factor: <strong className="text-amber-400">{healthData?.stress_level || 'LOW'}</strong>
            </p>
          </div>
        </div>

        <div className="space-y-2 text-xs text-slate-300 max-w-sm">
          <div className="font-bold text-white mb-1">Scoring Pillars:</div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span>Savings Discipline:</span>
            <span className="font-bold text-emerald-400">{healthData?.savings_ratio}% ratio</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800">
            <span>Debt-to-Income Safety:</span>
            <span className="font-bold text-amber-400">{healthData?.emi_to_income_ratio}% burden</span>
          </div>
          <div className="flex justify-between py-1">
            <span>Growth Trajectory:</span>
            <span className="font-bold text-indigo-400">{healthData?.savings_growth_rate}% YoY</span>
          </div>
        </div>
      </div>

      {/* Health Improvement Roadmap */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-400" />
          Personalized Financial Health Roadmap
        </h3>

        <div className="space-y-2.5">
          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Automate Emergency Reserve Allocation</div>
              <div className="text-slate-300 mt-0.5">Route 10% of monthly salary into a liquid deposit to build a 3-month safety moat (+6 health points).</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white">Maintain Debt-to-Income below 35%</div>
              <div className="text-slate-300 mt-0.5">Avoid high-interest consumer credit cards to protect long-term creditworthiness.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, Filter } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export const AdminDecisionMonitorPage: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStream = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/decision-stream');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load decision stream:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStream();
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-600 text-white shadow-lg shadow-purple-600/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">Admin AI Decision Monitor (Section 34)</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Live Policy Stream
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time visibility into AI model proposals vs Safety Gateway intercepts and anti-predatory enforcement.
              </p>
            </div>
          </div>

          <button
            onClick={fetchStream}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>
      </div>

      {/* Top Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">Active Customer Profiles</div>
          <div className="text-2xl font-black text-white mt-1">{data?.total_customers || 6}</div>
          <div className="text-[10px] text-slate-400 mt-1">Multi-tier Bharat personas</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">High Stress Vulnerabilities</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{data?.high_stress_count || 1}</div>
          <div className="text-[10px] text-amber-300/80 mt-1">Early warning triggered</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">Don't Sell Me Mode Active</div>
          <div className="text-2xl font-black text-amber-400 mt-1">{data?.active_dont_sell_me_count || 1}</div>
          <div className="text-[10px] text-amber-300/80 mt-1">Lending promotions suppressed</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl">
          <div className="text-xs text-slate-400 font-semibold">Fraud Alerts Pending</div>
          <div className="text-2xl font-black text-rose-400 mt-1">{data?.fraud_alerts_count || 1}</div>
          <div className="text-[10px] text-rose-300/80 mt-1">Statistical spikes flagged</div>
        </div>
      </div>

      {/* Live Decisions Matrix Table (Section 34 & Demo 7) */}
      <div className="glass-panel rounded-3xl overflow-hidden space-y-3 p-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Responsible AI Decision Pipeline (Demo Story 7)
            </h3>
            <p className="text-xs text-slate-400">Verifies how Safety Gateway overrides aggressive algorithmic proposals</p>
          </div>
          <span className="text-xs font-bold text-emerald-400">Safety Always Overrides Sales</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-3 px-3">Customer Profile</th>
                <th className="py-3 px-3">Stress / Health</th>
                <th className="py-3 px-3">AI Proposed Action</th>
                <th className="py-3 px-3">Safety Policy Gateway</th>
                <th className="py-3 px-3">Final Delivered Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {data?.decisions?.map((d: any, idx: number) => {
                const isBlocked = d.safety_gateway_decision === 'BLOCKED_BY_POLICY';

                return (
                  <tr key={idx} className={`hover:bg-slate-800/40 transition ${isBlocked ? 'bg-amber-950/20' : ''}`}>
                    <td className="py-3.5 px-3">
                      <div className="font-bold text-white">{d.customer_name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">ID: {d.customer_id} ({d.persona_tag})</div>
                    </td>

                    <td className="py-3.5 px-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${d.stress_level === 'HIGH' ? 'bg-rose-400 animate-ping' : d.stress_level === 'MEDIUM' ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                        <span className="font-bold">{d.stress_level}</span>
                        <span className="text-slate-400 text-[10px]">({d.health_score}/100)</span>
                      </div>
                      {d.dont_sell_me_active && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          DON'T SELL ME ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-semibold text-slate-300">
                      {d.ai_proposed_action}
                    </td>

                    <td className="py-3.5 px-3">
                      {isBlocked ? (
                        <div className="space-y-0.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                            BLOCKED BY POLICY
                          </span>
                          <p className="text-[10px] text-amber-300/90 leading-tight mt-1 max-w-xs">{d.block_reason}</p>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          APPROVED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-3 font-bold text-emerald-400">
                      {d.final_delivered_action}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

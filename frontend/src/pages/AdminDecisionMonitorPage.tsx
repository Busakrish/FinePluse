import React, { useState, useEffect } from 'react';
import { Layers, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, RefreshCw, Filter, Shield, Award, Users } from 'lucide-react';
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
      {/* Feature Purpose Explainer Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Admin AI Decision & Policy Monitor</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                  Section 34 • Live Stream
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Real-time visibility for Chief Risk Officers and auditors into AI model proposals vs. deterministic Safety Gateway intercepts.
              </p>
            </div>
          </div>

          <button
            onClick={fetchStream}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Stream</span>
          </button>
        </div>

        {/* How It Works 3-Step Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            How The Responsible AI Decision Pipeline Functions
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="font-bold text-slate-900">Algorithmic Proposal</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Machine learning engines suggest credit, loan, or investment products.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="font-bold text-slate-900">Policy Gateway Intercept</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Deterministic rules test customer vulnerability, stress score, & DPDPA consent.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="font-bold text-slate-900">Enforced Safe Delivery</div>
                <div className="text-slate-600 text-[11px] mt-0.5">If customer is under stress, predatory loans are blocked and relief is delivered.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Statistics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Customer Personas</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{data?.total_customers || 6}</div>
          <div className="text-[11px] text-slate-500 mt-1">Multi-tier Bharat benchmark accounts</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">High Stress Vulnerabilities</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{data?.high_stress_count || 1}</div>
          <div className="text-[11px] text-amber-700 font-medium mt-1">Early warning triggers fired</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Don't Sell Me Mode Active</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{data?.active_dont_sell_me_count || 1}</div>
          <div className="text-[11px] text-slate-500 mt-1">All lending marketing suppressed</div>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Fraud Alerts Active</div>
          <div className="text-2xl font-black text-rose-700 mt-1">{data?.fraud_alerts_count || 1}</div>
          <div className="text-[11px] text-slate-500 mt-1">Statistical velocity spikes flagged</div>
        </div>
      </div>

      {/* Live Decisions Matrix Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Responsible AI Decision Pipeline (Demo Story 7)
            </h3>
            <p className="text-xs text-slate-500">
              Demonstrating algorithmic accountability: Deterministic safety rules override marketing models.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
            Safety Always Overrides Sales
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 bg-slate-50 font-bold">
                <th className="py-3.5 px-4">Customer Profile</th>
                <th className="py-3.5 px-4">Stress / Health Score</th>
                <th className="py-3.5 px-4">AI Model Proposal</th>
                <th className="py-3.5 px-4">Safety Policy Gateway</th>
                <th className="py-3.5 px-4">Final Enforced Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {data?.decisions?.map((d: any, idx: number) => {
                const isBlocked = d.safety_gateway_decision === 'BLOCKED_BY_POLICY';

                return (
                  <tr key={idx} className={`transition ${isBlocked ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50/80'}`}>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{d.customer_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">ID: {d.customer_id} ({d.persona_tag})</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${d.stress_level === 'HIGH' ? 'bg-rose-600 animate-ping' : d.stress_level === 'MEDIUM' ? 'bg-amber-500' : 'bg-emerald-600'}`} />
                        <span className="font-bold text-slate-900">{d.stress_level}</span>
                        <span className="text-slate-500 text-[11px]">({d.health_score}/100)</span>
                      </div>
                      {d.dont_sell_me_active && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-800 border border-amber-300">
                          DON'T SELL ME ACTIVE
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {d.ai_proposed_action}
                    </td>

                    <td className="py-3.5 px-4">
                      {isBlocked ? (
                        <div className="space-y-1">
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300">
                            BLOCKED BY POLICY
                          </span>
                          <p className="text-[11px] text-amber-900 font-medium leading-tight max-w-xs">{d.block_reason}</p>
                        </div>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          APPROVED
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      <span className={isBlocked ? 'text-blue-800 font-extrabold' : 'text-emerald-700 font-extrabold'}>
                        {d.final_delivered_action}
                      </span>
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

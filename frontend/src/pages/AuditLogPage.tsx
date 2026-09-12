import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, RefreshCw, ShieldCheck, Filter, Shield, Award, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { AuditLog } from '../types';

export const AuditLogPage: React.FC = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEngine, setFilterEngine] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/audit-logs');
      if (res.data.success) {
        setLogs(res.data.audit_logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [user]);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.event_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.final_action_taken.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.customer_id && l.customer_id.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesEngine = filterEngine === 'ALL' || l.ai_engine === filterEngine;
    return matchesSearch && matchesEngine;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Feature Purpose Explainer Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Immutable Regulatory Audit Trail</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  RBI & DPDPA Compliant
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Cryptographically verifiable, append-only ledger tracking all behavioral calculations, safety blocks, fraud flags, and consent updates.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>

        {/* How It Works 3-Step Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            How The Audit Ledger Guarantees Integrity
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="font-bold text-slate-900">Zero-Tamper Append</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Every AI engine output & gateway intercept is permanently timestamped.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="font-bold text-slate-900">Deterministic Justification</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Records exact algorithmic input vectors and rule-based override explanations.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="font-bold text-slate-900">Regulator Readiness</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Instantly verifiable during statutory audits by RBI or appellate tribunals.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search event type, customer ID, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:bg-white focus:outline-none focus:border-blue-600 transition"
          />
        </div>

        <select
          value={filterEngine}
          onChange={(e) => setFilterEngine(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-semibold focus:bg-white focus:outline-none focus:border-blue-600 shrink-0 w-full sm:w-auto transition"
        >
          <option value="ALL">All AI Engines & Gateways</option>
          <option value="ENGINE_1_BEHAVIORAL">Engine 1: Behavioral</option>
          <option value="ENGINE_2_RECOMMENDATION">Engine 2: Recommendation</option>
          <option value="ENGINE_3_STRESS">Engine 3: Stress</option>
          <option value="ENGINE_4_FRAUD">Engine 4: Fraud</option>
          <option value="ENGINE_5_VERNACULAR">Engine 5: Vernacular</option>
          <option value="ENGINE_6_WHATIF">Engine 6: What-If</option>
          <option value="SAFETY_GATEWAY">Safety & Policy Gateway</option>
        </select>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-700 bg-slate-50 font-bold">
                <th className="py-3.5 px-4">Timestamp (IST)</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Engine Layer</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Policy Decision</th>
                <th className="py-3.5 px-4">Action Taken / Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500 font-medium">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900">
                      {log.event_type}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {log.ai_engine}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                      {log.customer_id || 'SYSTEM'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold ${
                        log.policy_decision === 'ALLOWED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : log.policy_decision === 'SUPPRESSED_DONT_SELL_ME'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}>
                        {log.policy_decision}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-700 max-w-md leading-relaxed font-medium">
                      {log.final_action_taken}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

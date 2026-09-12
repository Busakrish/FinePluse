import React, { useState, useEffect } from 'react';
import { FileSpreadsheet, Search, RefreshCw, ShieldCheck, Filter } from 'lucide-react';
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
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-white">Immutable Regulatory Audit Trail (Section 35)</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RBI & DPDPA Compliant
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Complete traceability for all behavioral calculations, safety blocks, fraud flags, and consent updates.
              </p>
            </div>
          </div>

          <button
            onClick={fetchLogs}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Logs</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search event type, customer ID, or action..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
          />
        </div>

        <select
          value={filterEngine}
          onChange={(e) => setFilterEngine(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 shrink-0 w-full sm:w-auto"
        >
          <option value="ALL">All AI Engines</option>
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
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/60">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Engine Layer</th>
                <th className="py-3.5 px-4">Customer ID</th>
                <th className="py-3.5 px-4">Policy Decision</th>
                <th className="py-3.5 px-4">Final Action Taken</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-200">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No audit records match the selected filter.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-4 font-bold text-white">
                      {log.event_type}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-indigo-300 border border-slate-700">
                        {log.ai_engine}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[10px] text-slate-400">
                      {log.customer_id || 'SYSTEM'}
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.policy_decision === 'ALLOWED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : log.policy_decision === 'SUPPRESSED_DONT_SELL_ME'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {log.policy_decision}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-300 max-w-sm leading-tight">
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

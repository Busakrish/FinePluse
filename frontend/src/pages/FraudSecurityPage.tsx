import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, Lock, ArrowRight, Eye, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { FraudAlert } from '../types';

export const FraudSecurityPage: React.FC = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolvedIds, setResolvedIds] = useState<string[]>([]);

  const fetchFraudAlerts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/ai/fraud-alerts');
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (err) {
      console.error('Failed to load fraud alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFraudAlerts();
  }, [user]);

  const handleResolve = (alertId: string) => {
    setResolvedIds((prev) => [...prev, alertId]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">Fraud & Anomaly Detection Center (Engine 4)</h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                Hybrid AI / Z-Score
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Real-time statistical outlier detection flagging unusual spikes, odd timestamps, and suspicious merchants.
            </p>
          </div>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          Active Security Flags ({alerts.length})
        </h3>

        {alerts.length === 0 ? (
          <div className="glass-panel p-8 rounded-3xl text-center space-y-2 text-slate-400 text-xs">
            <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto" />
            <div className="font-bold text-white text-sm">Account Security Normal</div>
            <p>No anomalous patterns detected in recent transactional activities.</p>
          </div>
        ) : (
          alerts.map((item) => {
            const isResolved = resolvedIds.includes(item.id);
            return (
              <div key={item.id} className="glass-panel p-6 rounded-3xl border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/90 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 uppercase">
                          {item.risk_level} RISK ANOMALY
                        </span>
                        <span className="text-xs text-slate-400">Z-Score: <strong className="text-rose-300">{item.z_score || 4.8}</strong></span>
                      </div>
                      <h4 className="text-base font-bold text-white mt-1">
                        Unusual Outflow of ₹{item.amount.toLocaleString('en-IN')} Flagged
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs text-slate-400">
                    {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} hrs
                  </span>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed font-medium">
                  {item.trigger_reason}
                </p>

                {/* Factors Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Why was this transaction flagged?
                  </div>
                  <div className="space-y-1.5">
                    {item.anomaly_factors?.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800">
                  <div className="text-[11px] text-slate-400">
                    Protected by FinPulse Anomaly Shield
                  </div>
                  {isResolved ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Action Verified as Legitimate</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                      >
                        Yes, I Made This Payment
                      </button>
                      <button
                        onClick={() => window.alert('Simulated Security Action: Account temporary freeze activated. SMS alert sent.')}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition"
                      >
                        Block & Freeze Account
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

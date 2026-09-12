import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, ShieldCheck, CheckCircle2, Lock, ArrowRight, Eye, RefreshCw, AlertOctagon, Check, Shield } from 'lucide-react';
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
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Feature Purpose Explainer Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Fraud & Anomaly Security Center</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                  Engine 4 • Statistical Z-Score
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Real-time 24x7 behavioral surveillance flagging unusual velocity spikes, abnormal amounts, and unauthorized merchants.
              </p>
            </div>
          </div>
          <button
            onClick={fetchFraudAlerts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition shrink-0 self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Scan Account</span>
          </button>
        </div>

        {/* How It Works 3-Step Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            How Anomaly Shield Protects Your Funds
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="font-bold text-slate-900">Continuous Profiling</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Learns historical transaction times, average ticket size, and frequent payees.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-rose-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="font-bold text-slate-900">Z-Score Spike Detection</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Flags outflows exceeding 3 standard deviations (&gt;3.0σ) from normal behavior.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="font-bold text-slate-900">Citizen Safeguard</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Instant verification prompt or 1-click emergency UPI/card kill-switch.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Account Security Status</div>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${alerts.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className={`text-lg font-black ${alerts.length > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
              {alerts.length > 0 ? `${alerts.length} Flagged Anomaly` : '100% Secure'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Real-time gateway monitoring active</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Outlier Scoring Protocol</div>
          <div className="text-lg font-black text-slate-900 mt-2">Standardized Normal (Z)</div>
          <p className="text-[11px] text-slate-500 mt-1">Trigger condition: Z-Score &gt; 3.00</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Simulated Account Freeze</div>
          <div className="text-lg font-black text-blue-700 mt-2">Instant 1-Click Kill Switch</div>
          <p className="text-[11px] text-slate-500 mt-1">Zero-liability customer protection</p>
        </div>
      </div>

      {/* Alerts Stream */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Active Transaction Flags ({alerts.length})
          </h3>
          <span className="text-xs text-slate-500 font-medium">Auto-refreshed with every UPI debit</span>
        </div>

        {alerts.length === 0 ? (
          <div className="bg-white border border-slate-200 p-10 rounded-3xl text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="font-black text-slate-900 text-lg">Account Behavior is Normal</div>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              No anomalous spikes, high-frequency transactions, or unverified foreign merchants detected in your passbook history.
            </p>
          </div>
        ) : (
          alerts.map((item) => {
            const isResolved = resolvedIds.includes(item.id);
            return (
              <div
                key={item.id}
                className="bg-white border-2 border-rose-200 p-6 sm:p-7 rounded-3xl shadow-xs space-y-5"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                      <AlertOctagon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300 uppercase">
                          {item.risk_level} Risk Anomaly Flagged
                        </span>
                        <span className="text-xs text-slate-500 font-semibold">
                          Statistical Z-Score: <strong className="text-rose-700">{item.z_score || 4.8}</strong>
                        </span>
                      </div>
                      <h4 className="text-lg font-black text-slate-900 mt-1">
                        Unusual Outflow of ₹{item.amount.toLocaleString('en-IN')} Detected
                      </h4>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 font-medium self-start sm:self-auto bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                    {new Date(item.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} hrs
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 font-semibold leading-relaxed">
                  {item.trigger_reason}
                </div>

                {/* Factors Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Algorithmic Detection Rationale:
                  </div>
                  <div className="space-y-1.5">
                    {item.anomaly_factors?.map((f, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="font-medium">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                  <div className="text-xs text-slate-500 font-medium">
                    Protected by FinPulse Anomaly Shield • Zero Customer Liability
                  </div>
                  {isResolved ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Action Confirmed as Legitimate by Account Holder</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleResolve(item.id)}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition"
                      >
                        Yes, I Made This Payment
                      </button>
                      <button
                        onClick={() => window.alert('Simulated Security Action: Account temporary freeze activated. SMS alert sent to registered mobile.')}
                        className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs transition"
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

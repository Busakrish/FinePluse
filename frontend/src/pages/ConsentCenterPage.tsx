import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Consent } from '../types';

export const ConsentCenterPage: React.FC = () => {
  const { user } = useAuth();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchConsent = async () => {
    setLoading(true);
    try {
      const res = await api.get('/consents/my');
      if (res.data.success) {
        setConsent(res.data.consent);
      }
    } catch (err) {
      console.error('Failed to load consent:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsent();
  }, [user]);

  const handleToggle = (key: keyof Omit<Consent, 'id' | 'customer_id' | 'updated_at'>) => {
    if (!consent) return;
    setConsent({ ...consent, [key]: !consent[key] });
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    if (!consent) return;
    setSaving(true);
    try {
      const res = await api.put('/consents/update', consent);
      if (res.data.success) {
        setConsent(res.data.consent);
        setSaveSuccess(true);
      }
    } catch (err) {
      console.error('Failed to update consent:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">DPDPA 2023 Consent Center (Section 26)</h2>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Privacy by Design
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Granular consent controls aligning with India's Digital Personal Data Protection Act.
            </p>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="space-y-4">
          {/* Permission 1 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">Transaction & Cashflow Analysis</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Purpose: Health Scoring</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Allows AI to calculate your monthly surplus, spending categories, and liquid emergency buffer.
              </p>
            </div>

            <button
              onClick={() => handleToggle('transaction_analysis')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${consent?.transaction_analysis ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${consent?.transaction_analysis ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Permission 2 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">Financial Health & Stress Monitoring</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Purpose: Vulnerability Protection</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Enables early warning alerts for high EMI burdens, missed payments, and activates Don't Sell Me Mode.
              </p>
            </div>

            <button
              onClick={() => handleToggle('financial_health_analysis')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${consent?.financial_health_analysis ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${consent?.financial_health_analysis ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Permission 3 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">Hyper-Personalized Product Recommendations</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Purpose: Tailored Offers</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Matches pre-approved savings, gold SIP, and loan opportunities to your surplus. If OFF, no promotional offers are generated.
              </p>
            </div>

            <button
              onClick={() => handleToggle('personalized_recommendations')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${consent?.personalized_recommendations ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${consent?.personalized_recommendations ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>

          {/* Permission 4 */}
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-xs sm:text-sm">Marketing & Notification Personalization</span>
                <span className="text-[10px] px-2 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">Purpose: Vernacular Prompts</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Permits customized reminders for bill dues and goal milestones in your preferred language.
              </p>
            </div>

            <button
              onClick={() => handleToggle('marketing_personalization')}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${consent?.marketing_personalization ? 'bg-indigo-600' : 'bg-slate-700'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform absolute top-0.5 ${consent?.marketing_personalization ? 'left-6.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                Consent preferences saved & recorded to immutable audit log!
              </span>
            ) : (
              'Changes take effect immediately across all 6 AI engines.'
            )}
          </span>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Consent...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

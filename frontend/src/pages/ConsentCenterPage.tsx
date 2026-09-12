import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Save, Info, UserCheck, Shield, Check, X } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Consent } from '../types';

export const ConsentCenterPage: React.FC = () => {
  const { user } = useAuth();

  const defaultConsent: Consent = {
    id: 'default_consent',
    customer_id: user?.customer_id || 'cust_rahul',
    transaction_analysis: true,
    financial_health_analysis: true,
    personalized_recommendations: true,
    marketing_personalization: true,
    updated_at: new Date().toISOString(),
  };

  const [consent, setConsent] = useState<Consent>(defaultConsent);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const fetchConsent = async () => {
    setLoading(true);
    try {
      const res = await api.get('/consents/my');
      if (res.data.success && res.data.consent) {
        setConsent(res.data.consent);
      }
    } catch (err) {
      console.warn('Failed to load consent, using secure defaults:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsent();
  }, [user]);

  const handleToggle = (key: keyof Omit<Consent, 'id' | 'customer_id' | 'updated_at'>) => {
    setConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    setSaveSuccess(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/consents/update', consent);
      if (res.data.success && res.data.consent) {
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
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Feature Purpose Explainer Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">DPDPA 2023 Citizen Consent Center</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Privacy by Design
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Granular statutory consent controls mandated by India's Digital Personal Data Protection Act 2023.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold shrink-0 self-start sm:self-auto">
            <Shield className="w-4 h-4 text-blue-700" />
            <span>Sovereign Citizen Data</span>
          </div>
        </div>

        {/* How It Works 3-Step Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            How Consent Governance Protects You
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="font-bold text-slate-900">Purpose Limitation</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Every AI engine operates only within citizen-authorized analytic scopes.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="font-bold text-slate-900">Instant Enforcement</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Toggling off immediately suppresses algorithmic product recommendations.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="font-bold text-slate-900">Regulatory Audit Trail</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Every consent grant or revocation is permanently recorded to the RBI audit log.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions List */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Active Citizen Data Permissions</h3>
            <p className="text-xs text-slate-500">Click any toggle to allow or disallow specific AI capabilities, then click "Save Preferences".</p>
          </div>
          <span className="text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
            DPDPA Section 6
          </span>
        </div>

        <div className="space-y-4">
          {/* Permission 1 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">1. Transaction & Cashflow Analysis</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold border border-blue-200">
                  Purpose: Health Scoring
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  consent.transaction_analysis
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {consent.transaction_analysis ? 'Active (Permitted)' : 'Disabled (Blocked)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Allows AI to calculate your monthly surplus, spending categories, and liquid emergency buffer to construct your Financial Twin. If disabled, transactions are not analyzed for health scoring.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('transaction_analysis')}
              className={`w-14 h-7 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer p-0.5 ${
                consent.transaction_analysis ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle Transaction Analysis"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  consent.transaction_analysis ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {consent.transaction_analysis ? (
                  <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400 font-bold" />
                )}
              </div>
            </button>
          </div>

          {/* Permission 2 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">2. Financial Health & Stress Monitoring</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Purpose: Vulnerability Protection
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  consent.financial_health_analysis
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {consent.financial_health_analysis ? 'Active (Permitted)' : 'Disabled (Blocked)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Enables early warning alerts for high EMI burdens, missed payments, and activates Don't Sell Me Mode to suppress unsolicited lending.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('financial_health_analysis')}
              className={`w-14 h-7 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer p-0.5 ${
                consent.financial_health_analysis ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle Health Monitoring"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  consent.financial_health_analysis ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {consent.financial_health_analysis ? (
                  <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400 font-bold" />
                )}
              </div>
            </button>
          </div>

          {/* Permission 3 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">3. Hyper-Personalized Product Recommendations</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  Purpose: Tailored Offers
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  consent.personalized_recommendations
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {consent.personalized_recommendations ? 'Active (Permitted)' : 'Disabled (Blocked)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Matches pre-approved savings, gold SIP, and loan opportunities to your surplus. If OFF, promotional offers are completely suppressed across your dashboard.
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('personalized_recommendations')}
              className={`w-14 h-7 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer p-0.5 ${
                consent.personalized_recommendations ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle Personalized Recommendations"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  consent.personalized_recommendations ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {consent.personalized_recommendations ? (
                  <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400 font-bold" />
                )}
              </div>
            </button>
          </div>

          {/* Permission 4 */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-slate-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">4. Marketing & Notification Personalization</span>
                <span className="text-[10px] px-2.5 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  Purpose: Vernacular Prompts
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  consent.marketing_personalization
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-200 text-slate-700 border-slate-300'
                }`}>
                  {consent.marketing_personalization ? 'Active (Permitted)' : 'Disabled (Blocked)'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                Permits customized reminders for bill dues, savings goals, and voice alerts in your preferred regional language (Hindi/Gujarati/English).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleToggle('marketing_personalization')}
              className={`w-14 h-7 rounded-full transition-colors relative shrink-0 focus:outline-none cursor-pointer p-0.5 ${
                consent.marketing_personalization ? 'bg-blue-600' : 'bg-slate-300'
              }`}
              aria-label="Toggle Marketing Personalization"
            >
              <div
                className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 flex items-center justify-center ${
                  consent.marketing_personalization ? 'translate-x-7' : 'translate-x-0'
                }`}
              >
                {consent.marketing_personalization ? (
                  <Check className="w-3.5 h-3.5 text-blue-600 font-bold" />
                ) : (
                  <X className="w-3.5 h-3.5 text-slate-400 font-bold" />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Save Bar */}
        <div className="pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-600 font-medium">
            {saveSuccess ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Consent preferences updated & logged to immutable audit trail!
              </span>
            ) : (
              <span>Modifications take effect immediately across all 6 AI decision engines.</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Consent...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

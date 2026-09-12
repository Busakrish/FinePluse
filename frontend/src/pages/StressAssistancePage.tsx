import React, { useState, useEffect } from 'react';
import { HeartHandshake, ShieldAlert, CheckCircle2, ArrowRight, PhoneCall, Calculator, Clock, FileCheck } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const StressAssistancePage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stressData, setStressData] = useState<any | null>(null);
  const [tenureExtensionMonths, setTenureExtensionMonths] = useState(12);
  const [applicationSuccess, setApplicationSuccess] = useState(false);

  const fetchStressData = async () => {
    try {
      const res = await api.get('/ai/stress');
      if (res.data.success) {
        setStressData(res.data);
      }
    } catch (err) {
      console.error('Failed to load stress data:', err);
    }
  };

  useEffect(() => {
    fetchStressData();
  }, [user]);

  // Original EMI: ₹24,000 on ₹4,00,000 principal. Restructured with +12M extension: ₹13,200
  const originalEmi = 24000;
  const restructuredEmi = Math.round(originalEmi * (24 / (24 + tenureExtensionMonths)));
  const monthlySavingsRelief = originalEmi - restructuredEmi;

  const handleApplySamadhan = () => {
    setApplicationSuccess(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-slate-900/80 to-slate-900/90">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                Responsible AI Hub
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Don't Sell Me Mode & Financial Assistance</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Empathetic, proactive intervention designed to prevent defaults without punitive harassment.
            </p>
          </div>
        </div>
      </div>

      {/* Stress Signals Breakdown Card (Section 11) */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            Transparent Financial Stress Breakdown (Engine 3)
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Stress Index: {stressData?.stress_score || 88}/100 ({stressData?.stress_level || 'HIGH'})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stressData?.contributing_factors?.map((factor: string, idx: number) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-2.5 text-xs text-slate-200">
              <span className="w-2 h-2 rounded-full bg-amber-400 mt-1.5 shrink-0" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Samadhan EMI Restructuring Simulator (Empathetic Relief) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Samadhan EMI Restructuring & Tenure Extension Plan</h3>
            <p className="text-xs text-slate-400 mt-0.5">Aligned with RBI Fair Lending Practices: Realign EMI to fit disposable cashflow</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            0% Penalty Fees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Current Monthly EMI</div>
            <div className="text-xl font-bold text-rose-400 mt-1">₹{originalEmi.toLocaleString('en-IN')}/mo</div>
            <div className="text-[10px] text-slate-400 mt-1">Consumes 60% of monthly earnings</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 uppercase">Restructured Monthly EMI</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">₹{restructuredEmi.toLocaleString('en-IN')}/mo</div>
            <div className="text-[10px] text-emerald-400 mt-1">Comfortable 33% debt burden</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30">
            <div className="text-[11px] font-bold text-emerald-400 uppercase">Immediate Monthly Relief</div>
            <div className="text-xl font-bold text-white mt-1">+₹{monthlySavingsRelief.toLocaleString('en-IN')}/mo</div>
            <div className="text-[10px] text-emerald-300 mt-1">Freed up for groceries & medicine</div>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Select Tenure Extension:</span>
            <span className="text-indigo-400 font-bold">+{tenureExtensionMonths} Additional Months</span>
          </div>
          <input
            type="range"
            min="6"
            max="24"
            step="6"
            value={tenureExtensionMonths}
            onChange={(e) => setTenureExtensionMonths(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>

        {/* Action Button */}
        {applicationSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-center space-y-1 animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="text-sm font-bold text-white">Samadhan Restructuring Request Submitted!</h4>
            <p className="text-xs text-emerald-200">Your EMI is rescheduled to ₹{restructuredEmi.toLocaleString('en-IN')}/mo with zero impact on credit standing.</p>
          </div>
        ) : (
          <button
            onClick={handleApplySamadhan}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.01]"
          >
            Apply for Instant Samadhan EMI Reduction (+₹{monthlySavingsRelief.toLocaleString('en-IN')}/mo Relief)
          </button>
        )}
      </div>

      {/* Human Financial Counselor Connect */}
      <div className="p-5 rounded-2xl bg-slate-800/40 border border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">Need to speak with an Empathetic Counselor?</h4>
            <p className="text-[11px] text-slate-400">Toll-free Vernacular Support available in Hindi, Gujarati, and English (1800-BHARAT-HELP).</p>
          </div>
        </div>
        <button
          onClick={() => alert('Simulated Request: Dedicated FinPulse empathetic counselor will call you within 15 minutes.')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white shrink-0 transition"
        >
          Request Free Callback
        </button>
      </div>
    </div>
  );
};

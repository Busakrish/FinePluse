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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-700 to-amber-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                Responsible AI Hub • Engine 3
              </span>
              <span className="text-xs text-amber-200">Anti-Predatory Safeguard</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Don't Sell Me Mode & Financial Relief</h2>
            <p className="text-xs sm:text-sm text-amber-100 mt-0.5 leading-relaxed">
              Empathetic, proactive intervention that detects cashflow stress early. Automatically blocks aggressive loan marketing and provides zero-penalty EMI restructuring.
            </p>
          </div>
        </div>
      </div>

      {/* Stress Signals Breakdown Card (Section 11) */}
      <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-600" />
            Transparent Financial Stress Signals (Engine 3)
          </h3>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
            Stress Index: {stressData?.stress_score || 88}/100 ({stressData?.stress_level || 'HIGH'})
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {stressData?.contributing_factors?.map((factor: string, idx: number) => (
            <div key={idx} className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 flex items-start gap-2.5 text-xs text-amber-950 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Samadhan EMI Restructuring Simulator (Empathetic Relief) */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Samadhan EMI Restructuring & Tenure Extension</h3>
            <p className="text-xs text-slate-500 mt-0.5">Aligned with RBI Fair Lending Practices: Realign monthly commitment to fit real surplus</p>
          </div>
          <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
            0% Penalty Fees
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200">
            <div className="text-[11px] font-bold text-rose-800 uppercase">Current Monthly EMI</div>
            <div className="text-2xl font-black text-rose-700 mt-1">₹{originalEmi.toLocaleString('en-IN')}/mo</div>
            <div className="text-[10px] text-rose-800 mt-1 font-medium">Consumes 60% of monthly earnings</div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
            <div className="text-[11px] font-bold text-blue-800 uppercase">Restructured Monthly EMI</div>
            <div className="text-2xl font-black text-blue-700 mt-1">₹{restructuredEmi.toLocaleString('en-IN')}/mo</div>
            <div className="text-[10px] text-blue-800 mt-1 font-medium">Comfortable 33% debt burden</div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300">
            <div className="text-[11px] font-bold text-emerald-800 uppercase">Immediate Monthly Relief</div>
            <div className="text-2xl font-black text-emerald-800 mt-1">+₹{monthlySavingsRelief.toLocaleString('en-IN')}/mo</div>
            <div className="text-[10px] text-emerald-700 mt-1 font-medium">Freed up for household groceries & health</div>
          </div>
        </div>

        {/* Tenure Slider */}
        <div className="space-y-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex justify-between text-xs font-bold text-slate-700">
            <span>Select Tenure Extension:</span>
            <span className="text-blue-700 font-extrabold">+{tenureExtensionMonths} Additional Months</span>
          </div>
          <input
            type="range"
            min="6"
            max="24"
            step="6"
            value={tenureExtensionMonths}
            onChange={(e) => setTenureExtensionMonths(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
            <span>+6 Months</span>
            <span>+12 Months</span>
            <span>+18 Months</span>
            <span>+24 Months</span>
          </div>
        </div>

        {/* Action Button */}
        {applicationSuccess ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-center space-y-1 animate-in zoom-in-95">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-950">Samadhan Restructuring Request Submitted!</h4>
            <p className="text-xs text-emerald-800 font-medium">Your EMI is successfully rescheduled to ₹{restructuredEmi.toLocaleString('en-IN')}/mo with zero impact on credit score.</p>
          </div>
        ) : (
          <button
            onClick={handleApplySamadhan}
            className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-700 text-white shadow-xs transition-all hover:scale-[1.01]"
          >
            Apply for Instant Samadhan EMI Reduction (+₹{monthlySavingsRelief.toLocaleString('en-IN')}/mo Relief)
          </button>
        )}
      </div>

      {/* Human Financial Counselor Connect */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Need to speak with an Empathetic Counselor?</h4>
            <p className="text-[11px] text-slate-500 font-medium">Toll-free Vernacular Support available in Hindi, Gujarati, and English (1800-BHARAT-HELP).</p>
          </div>
        </div>
        <button
          onClick={() => alert('Simulated Request: Dedicated FinPulse empathetic counselor will call you within 15 minutes.')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 shrink-0 transition"
        >
          Request Free Callback
        </button>
      </div>
    </div>
  );
};

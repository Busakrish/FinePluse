import React, { useState } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Smartphone, FileText, Lock, Sparkles, Building2, BadgeCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const OnboardingKycPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [fullName, setFullName] = useState(user?.name || 'Ramesh Patel');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [city, setCity] = useState('Anand');
  const [state, setState] = useState('Gujarat');
  const [aadhaarMock, setAadhaarMock] = useState('XXXX-XXXX-8921');
  const [panMock, setPanMock] = useState('ABCDE1234F');
  const [otpMock, setOtpMock] = useState('123456');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Feature Purpose Explainer Banner */}
      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-700 border border-blue-200">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">Paperless Digital KYC & Onboarding</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                  RBI Master Direction 2016
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                Frictionless statutory onboarding engineered for millions of citizens across Tier 2/3/4 towns & rural Bharat.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold shrink-0 self-start sm:self-auto">
            <BadgeCheck className="w-4 h-4" />
            <span>DPDPA 2023 Protected</span>
          </div>
        </div>

        {/* How It Works 3-Step Banner */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
            How Digital Onboarding Works (Zero Paperwork)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
              <div>
                <div className="font-bold text-slate-900">Citizen Ingestion</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Basic identity & regional location capture.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
              <div>
                <div className="font-bold text-slate-900">Instant Verification</div>
                <div className="text-slate-600 text-[11px] mt-0.5">UIDAI synthetic OTP matching & NSDL PAN validation.</div>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
              <div>
                <div className="font-bold text-slate-900">AI Twin Activation</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Zero-balance account & predictive twin generated instantly.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps Tracker */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className={`p-3 rounded-xl text-xs font-bold text-center border transition ${
            step >= 1
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            1. Basic Profile
          </div>
          <div className={`p-3 rounded-xl text-xs font-bold text-center border transition ${
            step >= 2
              ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            2. Aadhaar OTP Verification
          </div>
          <div className={`p-3 rounded-xl text-xs font-bold text-center border transition ${
            step >= 3
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
              : 'bg-slate-50 text-slate-500 border-slate-200'
          }`}>
            3. DPDPA Consent & Passbook
          </div>
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 1: Citizen Profile Information</h3>
              <p className="text-xs text-slate-500">Provide official identity details as per your Government ID records.</p>
            </div>
            <span className="text-xs text-blue-700 font-semibold">Stage 1 of 3</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Mobile Number (Aadhaar-Linked)</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">City / Town / Tehsil</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
            >
              <span>Next: Synthetic KYC Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Synthetic Aadhaar / OTP */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Step 2: Instant Aadhaar e-KYC Verification</h3>
              <p className="text-xs text-slate-500">Fast digital verification matching UIDAI standards without physical paper.</p>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sandbox Mode Active</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Demo Aadhaar Reference</label>
              <input
                type="text"
                value={aadhaarMock}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">Demo PAN Reference</label>
              <input
                type="text"
                value={panMock}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-900">Simulated 6-Digit Aadhaar OTP</span>
              <button
                type="button"
                onClick={() => setOtpSent(true)}
                className="text-blue-700 hover:text-blue-900 font-bold underline"
              >
                {otpSent ? 'Resend OTP' : 'Send Test OTP to Mobile'}
              </button>
            </div>
            <input
              type="text"
              value={otpMock}
              onChange={(e) => setOtpMock(e.target.value)}
              placeholder="Enter 6-digit OTP (e.g. 123456)"
              className="w-full px-4 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-center tracking-widest text-lg font-mono focus:outline-none focus:border-blue-600 shadow-xs"
            />
            {otpSent && <p className="text-xs text-emerald-700 text-center font-semibold">Demo OTP 123456 delivered successfully to {phone}.</p>}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
            >
              <span>Verify & Complete KYC</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Consent & Onboarding Success */}
      {step === 3 && (
        <div className="bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl space-y-6 text-center shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto border-2 border-emerald-300 shadow-xs">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-black text-slate-900">Digital Onboarding Complete!</h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your synthetic KYC has been successfully verified. Your AI Financial Twin and digital passbook are now active with strict consumer safety protections.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-200 text-left text-xs text-slate-700 space-y-2 max-w-lg mx-auto">
            <div className="font-bold text-blue-900 flex items-center gap-2 text-sm">
              <Lock className="w-4 h-4 text-blue-700" />
              DPDPA 2023 Privacy Consent Registered
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Your personal data is encrypted under bank-grade tokenization. You retain sovereign control over transaction analysis, credit modeling, and promotional recommendations. You can adjust permissions anytime in the Consent Center.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
            >
              Start New Onboarding Demo
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

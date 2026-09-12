import React, { useState } from 'react';
import { UserCheck, ShieldCheck, CheckCircle2, ArrowRight, ArrowLeft, Smartphone, FileText, Lock } from 'lucide-react';
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
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Simplified Digital KYC & Onboarding (Section 24)</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Frictionless vernacular onboarding tailored for first-time Tier 2/3/4 & rural users.
            </p>
          </div>
        </div>

        {/* Steps Tracker */}
        <div className="grid grid-cols-3 gap-2 mt-6">
          <div className={`p-2.5 rounded-xl text-xs font-semibold text-center border ${step >= 1 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            1. Basic Profile
          </div>
          <div className={`p-2.5 rounded-xl text-xs font-semibold text-center border ${step >= 2 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            2. Aadhaar OTP Verification
          </div>
          <div className={`p-2.5 rounded-xl text-xs font-semibold text-center border ${step >= 3 ? 'bg-indigo-600 text-white border-indigo-500' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
            3. DPDPA Consent & Success
          </div>
        </div>
      </div>

      {/* Step 1: Personal Info */}
      {step === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <h3 className="text-base font-bold text-white">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mobile Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">City / Town</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">State</label>
              <input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Next: Synthetic KYC Verification</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Synthetic Aadhaar / OTP */}
      {step === 2 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-4">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Synthetic Demo KYC — No Real Documents Stored</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Demo Aadhaar Reference</label>
              <input
                type="text"
                value={aadhaarMock}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Demo PAN Reference</label>
              <input
                type="text"
                value={panMock}
                disabled
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-white">Simulated 6-Digit Aadhaar OTP</span>
              <button
                type="button"
                onClick={() => setOtpSent(true)}
                className="text-indigo-400 hover:text-indigo-300 font-bold"
              >
                {otpSent ? 'Resend OTP' : 'Send Test OTP'}
              </button>
            </div>
            <input
              type="text"
              value={otpMock}
              onChange={(e) => setOtpMock(e.target.value)}
              placeholder="Enter 6-digit OTP (e.g. 123456)"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-center tracking-widest text-lg font-mono focus:outline-none focus:border-indigo-500"
            />
            {otpSent && <p className="text-[11px] text-emerald-400 text-center">Demo OTP 123456 delivered successfully.</p>}
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Verify & Continue</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Consent & Onboarding Success */}
      {step === 3 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border-2 border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-bold text-white">Digital Onboarding Complete!</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              Your synthetic KYC is verified. Your AI Financial Twin is now initialized and ready to provide hyper-personalized insights.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-left text-xs text-slate-200 space-y-1.5 max-w-md mx-auto">
            <div className="font-bold text-indigo-300 flex items-center gap-1.5">
              <Lock className="w-4 h-4" />
              DPDPA 2023 Consent Registered
            </div>
            <p className="text-slate-400 text-[11px]">
              You maintain full control over transaction and recommendation analysis. Modify permissions anytime in the Consent Center.
            </p>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
          >
            Start New Onboarding Demo
          </button>
        </div>
      )}
    </div>
  );
};

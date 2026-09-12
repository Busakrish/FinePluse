import React, { useState } from 'react';
import { Landmark, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoanJourneyPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState(1);
  const [loanType, setLoanType] = useState('PERSONAL');
  const [principal, setPrincipal] = useState(250000);
  const [tenure, setTenure] = useState(24);
  const [purpose, setPurpose] = useState('Home Improvement & Renovation');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.post('/loans/simulate-journey', {
        loanType,
        principalAmount: principal,
        tenureMonths: tenure,
        purpose,
      });

      if (res.data.success) {
        setEvaluation(res.data.simulation_details);
        setStep(3); // Go to evaluation review step
      }
    } catch (err) {
      console.error('Loan journey error:', err);
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    '1. Product & Type Selection',
    '2. Amount & Tenure Configuration',
    '3. AI Affordability & Stress Gate Check',
    '4. Decision & Guidance Summary',
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                Ethical Lending Engine
              </span>
              <span className="text-xs text-blue-200">10-Step Protected Journey (Section 23)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Simulated Digital Loan Journey</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 leading-relaxed">
              Experience transparent, paperless borrowing powered by AI debt capacity verification and proactive distress prevention gates.
            </p>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          {stepsList.map((st, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl text-xs font-bold text-center border transition ${
                step === idx + 1
                  ? 'bg-white text-blue-900 border-white shadow-xs'
                  : step > idx + 1
                  ? 'bg-white/20 text-white border-white/30'
                  : 'bg-white/5 text-blue-200 border-white/10'
              }`}
            >
              {st}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Loan Type */}
      {step === 1 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 1: Choose Lending Category</h3>
            <p className="text-xs text-slate-500 mt-0.5">Select the loan product tailored to your specific cashflow profile.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'PERSONAL', label: 'Instant Personal Loan', rate: '10.25%', desc: 'Unsecured financing for personal emergency needs' },
              { id: 'KISAN_CREDIT', label: 'Kisan Samman Credit', rate: '4.00%', desc: 'Subsidized seasonal crop & rural dairy credit' },
              { id: 'HOME', label: 'Home Renovation Loan', rate: '8.75%', desc: 'Longer tenure secured credit for family upgrades' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLoanType(p.id)}
                className={`p-5 rounded-2xl text-left border transition shadow-xs ${
                  loanType === p.id
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold text-slate-900 text-sm">{p.label}</div>
                <div className="text-emerald-700 font-bold text-xs mt-1">Starting @ {p.rate} p.a.</div>
                <p className="text-[11px] text-slate-500 mt-2 font-medium leading-normal">{p.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
            >
              <span>Next: Amount & Tenure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Amount & Tenure */}
      {step === 2 && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div>
            <h3 className="text-base font-bold text-slate-900">Step 2: Configure Principal & Repayment Period</h3>
            <p className="text-xs text-slate-500 mt-0.5">Adjust borrowing parameters to simulate monthly commitment.</p>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Required Loan Amount</span>
                <span className="text-slate-900 font-extrabold text-base">₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Tenure Selection</span>
                <span className="text-slate-900 font-extrabold text-base">{tenure} Months ({Math.round(tenure / 12)} Years)</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
              />
            </div>
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
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs transition"
            >
              <span>{loading ? 'Evaluating Safety Gate...' : 'Run Affordability Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Safety Check & Guidance Summary */}
      {step === 3 && evaluation && (
        <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
          <div className={`p-6 rounded-2xl border shadow-xs ${
            evaluation.status === 'BLOCKED_HIGH_STRESS'
              ? 'bg-rose-50 border-rose-300'
              : evaluation.status === 'CAUTION_MANAGEABLE'
              ? 'bg-amber-50 border-amber-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                evaluation.status === 'BLOCKED_HIGH_STRESS'
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}>
                {evaluation.status === 'BLOCKED_HIGH_STRESS' ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-900 shadow-xs">
                  Assessment: {evaluation.status}
                </span>
                <h4 className="text-base font-bold text-slate-900">
                  {evaluation.status === 'BLOCKED_HIGH_STRESS'
                    ? 'Lending Promotion Blocked: Financial Stress Detected'
                    : 'Affordability & Debt Capacity Verified'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                  {evaluation.guidance}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Calculated EMI</span>
              <div className="text-sm font-black text-slate-900 mt-1">₹{evaluation.calculated_emi.toLocaleString('en-IN')}/mo</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Interest Rate</span>
              <div className="text-sm font-black text-emerald-700 mt-1">{evaluation.interest_rate}% p.a.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Simulated Debt Burden</span>
              <div className="text-sm font-black text-amber-800 mt-1">{evaluation.simulated_debt_burden_percent}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] text-slate-500 uppercase font-bold">Stress State</span>
              <div className="text-sm font-black text-slate-900 mt-1">{evaluation.stress_level}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <strong className="text-slate-900">Prototype Notice (Section 23):</strong> This is an explainable simulation tool. AI does not perform real-world automated credit sanctions without full underwriting.
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-bold transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Simulation</span>
            </button>
            <button
              onClick={() => {
                alert('Simulated Application Submitted: Loan guidance logged and forwarded to underwriting sandbox.');
                setStep(1);
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
            >
              Complete Simulated Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

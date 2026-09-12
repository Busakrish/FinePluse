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
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Simulated Digital Loan Journey (Section 23)</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Frictionless lending simulation equipped with AI financial stress and debt capacity verification.
            </p>
          </div>
        </div>

        {/* Step Progress Tracker */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          {stepsList.map((st, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl text-xs font-semibold text-center border transition ${
                step === idx + 1
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : step > idx + 1
                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-400 border-slate-800'
              }`}
            >
              {st}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Select Loan Type */}
      {step === 1 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-bold text-white">Step 1: Choose Lending Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { id: 'PERSONAL', label: 'Instant Personal Loan', rate: '10.25%', desc: 'Unsecured financing for personal needs' },
              { id: 'KISAN_CREDIT', label: 'Kisan Samman Credit', rate: '4.00%', desc: 'Subsidized seasonal crop & dairy credit' },
              { id: 'HOME', label: 'Home Renovation Loan', rate: '8.75%', desc: 'Longer tenure credit for home upgrades' },
            ].map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setLoanType(p.id)}
                className={`p-5 rounded-2xl text-left border transition ${
                  loanType === p.id
                    ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-500/20'
                    : 'bg-slate-800/60 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <div className="font-bold text-white text-sm">{p.label}</div>
                <div className="text-emerald-400 font-bold text-xs mt-1">Starting @ {p.rate} p.a.</div>
                <p className="text-[11px] text-slate-400 mt-2">{p.desc}</p>
              </button>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <span>Next: Amount & Tenure</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Amount & Tenure */}
      {step === 2 && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <h3 className="text-base font-bold text-white">Step 2: Configure Principal & Repayment Period</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Required Loan Amount</span>
                <span className="text-white font-bold">₹{principal.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="50000"
                max="1000000"
                step="25000"
                value={principal}
                onChange={(e) => setPrincipal(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Tenure Selection</span>
                <span className="text-white font-bold">{tenure} Months ({Math.round(tenure / 12)} Years)</span>
              </div>
              <input
                type="range"
                min="12"
                max="60"
                step="6"
                value={tenure}
                onChange={(e) => setTenure(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
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
              onClick={handleSimulate}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
            >
              <span>{loading ? 'Evaluating Safety Gate...' : 'Run Affordability Verification'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: AI Safety Check & Guidance Summary */}
      {step === 3 && evaluation && (
        <div className="glass-panel p-6 sm:p-8 rounded-3xl space-y-6">
          <div className={`p-6 rounded-2xl border ${
            evaluation.status === 'BLOCKED_HIGH_STRESS'
              ? 'bg-rose-950/40 border-rose-500/40'
              : evaluation.status === 'CAUTION_MANAGEABLE'
              ? 'bg-amber-950/40 border-amber-500/40'
              : 'bg-emerald-950/40 border-emerald-500/40'
          }`}>
            <div className="flex items-start gap-4">
              <div className={`p-2.5 rounded-xl shrink-0 ${
                evaluation.status === 'BLOCKED_HIGH_STRESS'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-emerald-500/20 text-emerald-400'
              }`}>
                {evaluation.status === 'BLOCKED_HIGH_STRESS' ? <AlertTriangle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-white">
                  Assessment: {evaluation.status}
                </span>
                <h4 className="text-base font-bold text-white">
                  {evaluation.status === 'BLOCKED_HIGH_STRESS'
                    ? 'Lending Promotion Blocked: Financial Stress Detected'
                    : 'Affordability & Debt Capacity Verified'}
                </h4>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {evaluation.guidance}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Calculated EMI</span>
              <div className="text-sm font-bold text-white mt-1">₹{evaluation.calculated_emi.toLocaleString('en-IN')}/mo</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Interest Rate</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">{evaluation.interest_rate}% p.a.</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Simulated Debt Burden</span>
              <div className="text-sm font-bold text-amber-400 mt-1">{evaluation.simulated_debt_burden_percent}%</div>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase">Stress State</span>
              <div className="text-sm font-bold text-white mt-1">{evaluation.stress_level}</div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
            <strong>Prototype Disclaimer (Section 23):</strong> This is an explainable simulation tool. AI does not perform real-world automated credit sanctions without full underwriting.
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => setStep(2)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Modify Simulation</span>
            </button>
            <button
              onClick={() => {
                alert('Simulated Application Submitted: Loan guidance logged and forwarded to underwriting sandbox.');
                setStep(1);
              }}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition"
            >
              Complete Simulated Application
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

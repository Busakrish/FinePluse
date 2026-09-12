import React, { useState, useEffect } from 'react';
import { Sliders, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight, RefreshCw, Calculator, HelpCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const WhatIfPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [simType, setSimType] = useState<'TAKE_LOAN' | 'INCOME_DECREASE' | 'EXPENSE_REDUCTION' | 'INCREASE_SAVINGS'>('TAKE_LOAN');
  const [loanAmount, setLoanAmount] = useState(500000);
  const [interestRate, setInterestRate] = useState(10.5);
  const [tenureMonths, setTenureMonths] = useState(36);
  const [incomeDelta, setIncomeDelta] = useState(-20);
  const [expenseCut, setExpenseCut] = useState(3000);
  const [savingsBoost, setSavingsBoost] = useState(5000);

  const [loading, setLoading] = useState(false);
  const [simulation, setSimulation] = useState<any | null>(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/what-if/simulate', {
        simulationType: simType,
        loanAmount,
        interestRate,
        tenureMonths,
        incomeDeltaPercent: incomeDelta,
        expenseReductionAmount: expenseCut,
        monthlySavingsIncrease: savingsBoost,
      });

      if (res.data.success) {
        setSimulation(res.data.simulation);
      }
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [simType, loanAmount, interestRate, tenureMonths, incomeDelta, expenseCut, savingsBoost, user]);

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Financial What-If Simulator (Engine 6)</h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Deterministic scenario projection: Simulate loan obligations, income shocks, or savings plans before committing.
            </p>
          </div>
        </div>

        {/* Simulation Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          <button
            onClick={() => setSimType('TAKE_LOAN')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'TAKE_LOAN'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            💳 "What if I take a Loan?"
          </button>
          <button
            onClick={() => setSimType('INCOME_DECREASE')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'INCOME_DECREASE'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            📉 "What if Income drops?"
          </button>
          <button
            onClick={() => setSimType('EXPENSE_REDUCTION')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'EXPENSE_REDUCTION'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            ✂️ "What if I cut Expenses?"
          </button>
          <button
            onClick={() => setSimType('INCREASE_SAVINGS')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'INCREASE_SAVINGS'
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            🌱 "What if I save more?"
          </button>
        </div>
      </div>

      {/* Interactive Controls & Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Sliders */}
        <div className="glass-panel p-6 rounded-3xl space-y-5">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            Simulation Parameters
          </h3>

          {simType === 'TAKE_LOAN' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Loan Principal Amount</span>
                  <span className="text-white font-bold">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2000000"
                  step="25000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Interest Rate (Annual)</span>
                  <span className="text-white font-bold">{interestRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="18.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Repayment Tenure</span>
                  <span className="text-white font-bold">{tenureMonths} Months ({Math.round(tenureMonths / 12)} Yrs)</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          )}

          {simType === 'INCOME_DECREASE' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Income Change Percentage</span>
                <span className="text-rose-400 font-bold">{incomeDelta}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="20"
                step="5"
                value={incomeDelta}
                onChange={(e) => setIncomeDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
            </div>
          )}

          {simType === 'EXPENSE_REDUCTION' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Monthly Expense Reduction</span>
                <span className="text-emerald-400 font-bold">₹{expenseCut.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={expenseCut}
                onChange={(e) => setExpenseCut(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          {simType === 'INCREASE_SAVINGS' && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                <span>Additional Monthly Savings Allocation</span>
                <span className="text-emerald-400 font-bold">₹{savingsBoost.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="1000"
                value={savingsBoost}
                onChange={(e) => setSavingsBoost(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
            <strong>Engine Note:</strong> All financial formulas use exact mathematical amortization equations (EMI = P * r * (1+r)^n / ((1+r)^n - 1)). Zero AI hallucination.
          </div>
        </div>

        {/* Right 2 Columns: CURRENT vs SIMULATED Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {simulation && (
            <>
              {/* Safety Assessment Verdict Banner */}
              <div className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                simulation.safety_assessment === 'SAFE'
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                  : simulation.safety_assessment === 'CAUTION'
                  ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
              }`}>
                <div className={`p-2 rounded-xl shrink-0 ${
                  simulation.safety_assessment === 'SAFE'
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : simulation.safety_assessment === 'CAUTION'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {simulation.safety_assessment === 'SAFE' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-700">
                      Simulation Verdict: {simulation.safety_assessment}
                    </span>
                    {simulation.simulated_metrics.new_emi_amount > 0 && (
                      <span className="text-xs font-bold text-white">
                        New EMI: ₹{simulation.simulated_metrics.new_emi_amount.toLocaleString('en-IN')}/mo
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 mt-1.5 leading-relaxed font-medium">
                    {simulation.ai_guidance}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Metrics Table (Section 14) */}
              <div className="glass-panel p-5 rounded-2xl space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Current State vs Simulated State Projection
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        <th className="py-2.5 px-3">Metric</th>
                        <th className="py-2.5 px-3">Current State</th>
                        <th className="py-2.5 px-3 text-indigo-300">Simulated State</th>
                        <th className="py-2.5 px-3">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-200">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Monthly Income</td>
                        <td className="py-2.5 px-3">₹{simulation.current_metrics.monthly_income.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-bold text-white">₹{simulation.simulated_metrics.monthly_income.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3">
                          {simulation.simulated_metrics.monthly_income !== simulation.current_metrics.monthly_income && (
                            <span className={simulation.simulated_metrics.monthly_income > simulation.current_metrics.monthly_income ? 'text-emerald-400' : 'text-rose-400'}>
                              {simulation.simulated_metrics.monthly_income > simulation.current_metrics.monthly_income ? '+' : ''}
                              ₹{(simulation.simulated_metrics.monthly_income - simulation.current_metrics.monthly_income).toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Total EMI Obligations</td>
                        <td className="py-2.5 px-3">₹{simulation.current_metrics.monthly_emi.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-400">₹{simulation.simulated_metrics.monthly_emi.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-amber-400">
                          {simulation.simulated_metrics.monthly_emi > simulation.current_metrics.monthly_emi
                            ? `+₹${(simulation.simulated_metrics.monthly_emi - simulation.current_metrics.monthly_emi).toLocaleString('en-IN')}/mo`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Debt Burden (% of Income)</td>
                        <td className="py-2.5 px-3">{simulation.current_metrics.debt_burden_percent}%</td>
                        <td className={`py-2.5 px-3 font-bold ${simulation.simulated_metrics.debt_burden_percent > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {simulation.simulated_metrics.debt_burden_percent}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={simulation.simulated_metrics.debt_burden_percent > 40 ? 'text-rose-400' : 'text-slate-400'}>
                            {simulation.simulated_metrics.debt_burden_percent > 40 ? '⚠️ High Burden' : '✓ Safe Limit'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Monthly Net Surplus</td>
                        <td className="py-2.5 px-3">₹{simulation.current_metrics.monthly_surplus.toLocaleString('en-IN')}</td>
                        <td className={`py-2.5 px-3 font-bold ${simulation.simulated_metrics.monthly_surplus < 3000 ? 'text-rose-400' : 'text-emerald-400'}`}>
                          ₹{simulation.simulated_metrics.monthly_surplus.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={simulation.simulated_metrics.monthly_surplus >= simulation.current_metrics.monthly_surplus ? 'text-emerald-400' : 'text-rose-400'}>
                            {simulation.simulated_metrics.monthly_surplus - simulation.current_metrics.monthly_surplus >= 0 ? '+' : ''}
                            ₹{(simulation.simulated_metrics.monthly_surplus - simulation.current_metrics.monthly_surplus).toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold">Financial Health Score</td>
                        <td className="py-2.5 px-3">{simulation.current_metrics.financial_health_score}/100</td>
                        <td className="py-2.5 px-3 font-bold text-cyan-300">{simulation.simulated_metrics.financial_health_score}/100</td>
                        <td className="py-2.5 px-3">
                          <span className={simulation.simulated_metrics.financial_health_score >= simulation.current_metrics.financial_health_score ? 'text-emerald-400' : 'text-rose-400'}>
                            {simulation.simulated_metrics.financial_health_score - simulation.current_metrics.financial_health_score >= 0 ? '+' : ''}
                            {simulation.simulated_metrics.financial_health_score - simulation.current_metrics.financial_health_score} pts
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

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
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <Calculator className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                AI Engine 6 • Deterministic Modeling
              </span>
              <span className="text-xs text-blue-200">Amortization Simulator</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Financial What-If Scenario Simulator</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 leading-relaxed">
              Test how new loans, salary adjustments, or expense cuts affect your family budget before committing. Powered by exact mathematical amortization.
            </p>
          </div>
        </div>

        {/* Simulation Type Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-6">
          <button
            onClick={() => setSimType('TAKE_LOAN')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'TAKE_LOAN'
                ? 'bg-white text-blue-900 border-white shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            💳 "What if I take a Loan?"
          </button>
          <button
            onClick={() => setSimType('INCOME_DECREASE')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'INCOME_DECREASE'
                ? 'bg-white text-blue-900 border-white shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            📉 "What if Income drops?"
          </button>
          <button
            onClick={() => setSimType('EXPENSE_REDUCTION')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'EXPENSE_REDUCTION'
                ? 'bg-white text-blue-900 border-white shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            ✂️ "What if I cut Expenses?"
          </button>
          <button
            onClick={() => setSimType('INCREASE_SAVINGS')}
            className={`p-3 rounded-xl text-xs font-bold text-left transition border ${
              simType === 'INCREASE_SAVINGS'
                ? 'bg-white text-blue-900 border-white shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            🌱 "What if I save more?"
          </button>
        </div>
      </div>

      {/* Interactive Controls & Simulator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Sliders */}
        <div className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-700" />
            Simulation Parameters
          </h3>

          {simType === 'TAKE_LOAN' && (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Loan Principal Amount</span>
                  <span className="text-slate-900 font-extrabold">₹{loanAmount.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min="50000"
                  max="2000000"
                  step="25000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Interest Rate (Annual)</span>
                  <span className="text-slate-900 font-extrabold">{interestRate}% p.a.</span>
                </div>
                <input
                  type="range"
                  min="6.0"
                  max="18.0"
                  step="0.25"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Repayment Tenure</span>
                  <span className="text-slate-900 font-extrabold">{tenureMonths} Months ({Math.round(tenureMonths / 12)} Yrs)</span>
                </div>
                <input
                  type="range"
                  min="12"
                  max="84"
                  step="6"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-700"
                />
              </div>
            </div>
          )}

          {simType === 'INCOME_DECREASE' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Income Change Percentage</span>
                <span className="text-rose-700 font-bold">{incomeDelta}%</span>
              </div>
              <input
                type="range"
                min="-50"
                max="20"
                step="5"
                value={incomeDelta}
                onChange={(e) => setIncomeDelta(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />
            </div>
          )}

          {simType === 'EXPENSE_REDUCTION' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Monthly Expense Reduction</span>
                <span className="text-emerald-700 font-bold">₹{expenseCut.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="15000"
                step="500"
                value={expenseCut}
                onChange={(e) => setExpenseCut(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          )}

          {simType === 'INCREASE_SAVINGS' && (
            <div>
              <div className="flex justify-between text-xs font-bold text-slate-700 mb-2">
                <span>Additional Monthly Savings Allocation</span>
                <span className="text-emerald-700 font-bold">₹{savingsBoost.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="25000"
                step="1000"
                value={savingsBoost}
                onChange={(e) => setSavingsBoost(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
          )}

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 font-medium">
            <strong className="text-slate-900">Deterministic Guarantee:</strong> Calculations execute standard banking amortization formula with zero LLM variance.
          </div>
        </div>

        {/* Right 2 Columns: CURRENT vs SIMULATED Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {simulation && (
            <>
              {/* Safety Assessment Verdict Banner */}
              <div className={`p-5 rounded-2xl border flex items-start gap-3.5 shadow-xs ${
                simulation.safety_assessment === 'SAFE'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : simulation.safety_assessment === 'CAUTION'
                  ? 'bg-amber-50 border-amber-300 text-amber-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}>
                <div className={`p-2 rounded-xl shrink-0 ${
                  simulation.safety_assessment === 'SAFE'
                    ? 'bg-emerald-100 text-emerald-800'
                    : simulation.safety_assessment === 'CAUTION'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {simulation.safety_assessment === 'SAFE' ? <ShieldCheck className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-white border border-slate-200 shadow-xs">
                      Simulation Verdict: {simulation.safety_assessment}
                    </span>
                    {simulation.simulated_metrics.new_emi_amount > 0 && (
                      <span className="text-xs font-bold text-slate-900">
                        New EMI: ₹{simulation.simulated_metrics.new_emi_amount.toLocaleString('en-IN')}/mo
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 mt-1.5 leading-relaxed font-medium">
                    {simulation.ai_guidance}
                  </p>
                </div>
              </div>

              {/* Side-by-Side Metrics Table (Section 14) */}
              <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Current State vs Simulated State Projection
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-2.5 px-3">Metric</th>
                        <th className="py-2.5 px-3">Current State</th>
                        <th className="py-2.5 px-3 text-blue-700">Simulated State</th>
                        <th className="py-2.5 px-3">Impact</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Monthly Income</td>
                        <td className="py-2.5 px-3">₹{simulation.current_metrics.monthly_income.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-bold text-blue-900">₹{simulation.simulated_metrics.monthly_income.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3">
                          {simulation.simulated_metrics.monthly_income !== simulation.current_metrics.monthly_income && (
                            <span className={simulation.simulated_metrics.monthly_income > simulation.current_metrics.monthly_income ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                              {simulation.simulated_metrics.monthly_income > simulation.current_metrics.monthly_income ? '+' : ''}
                              ₹{(simulation.simulated_metrics.monthly_income - simulation.current_metrics.monthly_income).toLocaleString('en-IN')}
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Total EMI Obligations</td>
                        <td className="py-2.5 px-3">₹{simulation.current_metrics.monthly_emi.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 font-bold text-amber-800">₹{simulation.simulated_metrics.monthly_emi.toLocaleString('en-IN')}</td>
                        <td className="py-2.5 px-3 text-amber-800 font-bold">
                          {simulation.simulated_metrics.monthly_emi > simulation.current_metrics.monthly_emi
                            ? `+₹${(simulation.simulated_metrics.monthly_emi - simulation.current_metrics.monthly_emi).toLocaleString('en-IN')}/mo`
                            : '-'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Debt Burden (% of Income)</td>
                        <td className="py-2.5 px-3">{simulation.current_metrics.debt_burden_percent}%</td>
                        <td className={`py-2.5 px-3 font-bold ${simulation.simulated_metrics.debt_burden_percent > 40 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          {simulation.simulated_metrics.debt_burden_percent}%
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={simulation.simulated_metrics.debt_burden_percent > 40 ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                            {simulation.simulated_metrics.debt_burden_percent > 40 ? '⚠️ High Burden' : '✓ Safe Limit'}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Monthly Net Surplus</td>
                        <td className="py-2.5 px-3">₹{simulation.current_metrics.monthly_surplus.toLocaleString('en-IN')}</td>
                        <td className={`py-2.5 px-3 font-bold ${simulation.simulated_metrics.monthly_surplus < 3000 ? 'text-rose-700' : 'text-emerald-700'}`}>
                          ₹{simulation.simulated_metrics.monthly_surplus.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={simulation.simulated_metrics.monthly_surplus >= simulation.current_metrics.monthly_surplus ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
                            {simulation.simulated_metrics.monthly_surplus - simulation.current_metrics.monthly_surplus >= 0 ? '+' : ''}
                            ₹{(simulation.simulated_metrics.monthly_surplus - simulation.current_metrics.monthly_surplus).toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Financial Health Score</td>
                        <td className="py-2.5 px-3">{simulation.current_metrics.financial_health_score}/100</td>
                        <td className="py-2.5 px-3 font-bold text-blue-700">{simulation.simulated_metrics.financial_health_score}/100</td>
                        <td className="py-2.5 px-3">
                          <span className={simulation.simulated_metrics.financial_health_score >= simulation.current_metrics.financial_health_score ? 'text-emerald-700 font-bold' : 'text-rose-700 font-bold'}>
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

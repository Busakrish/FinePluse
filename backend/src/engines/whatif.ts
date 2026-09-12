import { db } from '../db/database.js';
import { WhatIfSimulation } from '../db/types.js';

export interface WhatIfInput {
  customerId: string;
  simulationType: 'TAKE_LOAN' | 'INCOME_DECREASE' | 'EXPENSE_REDUCTION' | 'INCREASE_SAVINGS';
  loanAmount?: number;
  interestRate?: number; // annual percentage e.g. 10.5
  tenureMonths?: number;
  incomeDeltaPercent?: number; // e.g. -20 for 20% drop
  expenseReductionAmount?: number;
  monthlySavingsIncrease?: number;
}

export class WhatIfEngine {
  public static calculateEMI(principal: number, annualRatePercent: number, tenureMonths: number): number {
    if (principal <= 0 || tenureMonths <= 0) return 0;
    if (annualRatePercent <= 0) return Math.round(principal / tenureMonths);

    const monthlyRate = annualRatePercent / 12 / 100;
    const factor = Math.pow(1 + monthlyRate, tenureMonths);
    const emi = (principal * monthlyRate * factor) / (factor - 1);
    return Math.round(emi);
  }

  public static simulate(params: WhatIfInput): WhatIfSimulation {
    const profile = db.findById('customer_profiles', params.customerId);
    if (!profile) {
      throw new Error(`Customer profile not found for: ${params.customerId}`);
    }

    const twin = db.findOne('financial_twins', (t) => t.customer_id === params.customerId);

    const currentIncome = twin ? twin.monthly_income : profile.monthly_income;
    const currentExpenses = twin ? twin.monthly_expenses : 30000;
    const currentEmi = twin ? twin.monthly_emi_burden : 0;
    const currentSavings = Math.max(0, currentIncome - currentExpenses - currentEmi);
    const currentSurplus = currentIncome - currentExpenses - currentEmi;
    const currentDebtBurden = Number(((currentEmi / (currentIncome || 1)) * 100).toFixed(1));
    const currentHealthScore = twin ? twin.financial_health_score : 70;
    const currentStressLevel = twin ? twin.stress_level : 'LOW';

    let simIncome = currentIncome;
    let simExpenses = currentExpenses;
    let simEmi = currentEmi;
    let newEmiAmount = 0;
    let guidance = '';
    let assessment: 'SAFE' | 'CAUTION' | 'HIGH_RISK' = 'SAFE';

    switch (params.simulationType) {
      case 'TAKE_LOAN': {
        const principal = params.loanAmount || 500000;
        const rate = params.interestRate || 10.5;
        const tenure = params.tenureMonths || 36;
        newEmiAmount = this.calculateEMI(principal, rate, tenure);
        simEmi = currentEmi + newEmiAmount;

        const simDebtBurden = (simEmi / (simIncome || 1)) * 100;
        if (simDebtBurden > 50 || (simIncome - simExpenses - simEmi) < 3000) {
          assessment = 'HIGH_RISK';
          guidance = `Taking a ₹${principal.toLocaleString('en-IN')} loan will add an EMI of ₹${newEmiAmount.toLocaleString('en-IN')}/mo, pushing your debt burden to ${simDebtBurden.toFixed(1)}% of income. This creates severe liquidity risk.`;
        } else if (simDebtBurden > 35) {
          assessment = 'CAUTION';
          guidance = `The new EMI of ₹${newEmiAmount.toLocaleString('en-IN')}/mo brings debt burden to ${simDebtBurden.toFixed(1)}%. It is manageable if unexpected expenses remain low.`;
        } else {
          assessment = 'SAFE';
          guidance = `The new EMI of ₹${newEmiAmount.toLocaleString('en-IN')}/mo leaves a healthy buffer of ₹${(simIncome - simExpenses - simEmi).toLocaleString('en-IN')}/mo. Your financial foundation remains robust.`;
        }
        break;
      }

      case 'INCOME_DECREASE': {
        const deltaPct = params.incomeDeltaPercent ?? -20;
        simIncome = Math.round(currentIncome * (1 + deltaPct / 100));
        const simSurplus = simIncome - simExpenses - simEmi;
        if (simSurplus < 0) {
          assessment = 'HIGH_RISK';
          guidance = `A ${Math.abs(deltaPct)}% drop in earnings leads to a monthly deficit of ₹${Math.abs(simSurplus).toLocaleString('en-IN')}. Immediate expense pruning or EMI restructuring would be vital.`;
        } else {
          assessment = 'CAUTION';
          guidance = `Even with a ${Math.abs(deltaPct)}% reduction, you retain a positive surplus of ₹${simSurplus.toLocaleString('en-IN')}/mo.`;
        }
        break;
      }

      case 'EXPENSE_REDUCTION': {
        const cut = params.expenseReductionAmount || 3000;
        simExpenses = Math.max(0, currentExpenses - cut);
        assessment = 'SAFE';
        guidance = `Reducing monthly expenses by ₹${cut.toLocaleString('en-IN')} increases your annual savings by ₹${(cut * 12).toLocaleString('en-IN')}, elevating your financial health score by +8 points.`;
        break;
      }

      case 'INCREASE_SAVINGS': {
        const boost = params.monthlySavingsIncrease || 5000;
        assessment = 'SAFE';
        guidance = `Channeling an extra ₹${boost.toLocaleString('en-IN')}/month into recurring deposits will grow your safety cushion to ₹${(boost * 36).toLocaleString('en-IN')} in 3 years with compounding returns.`;
        break;
      }
    }

    const simSurplus = simIncome - simExpenses - simEmi;
    const simSavings = Math.max(0, simSurplus);
    const simDebtBurden = Number(((simEmi / (simIncome || 1)) * 100).toFixed(1));

    // Dynamic Simulated Health Score
    let simHealthScore = 50;
    if (simDebtBurden <= 25 && simSurplus >= 15000) {
      simHealthScore = 90;
    } else if (simDebtBurden <= 40 && simSurplus >= 5000) {
      simHealthScore = 72;
    } else if (simSurplus < 0 || simDebtBurden > 50) {
      simHealthScore = 32;
    } else {
      simHealthScore = 55;
    }

    let simStressLevel = 'LOW';
    if (simDebtBurden > 45 || simSurplus < 2000) {
      simStressLevel = 'HIGH';
    } else if (simDebtBurden > 30) {
      simStressLevel = 'MEDIUM';
    }

    const result: WhatIfSimulation = {
      id: `sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      customer_id: params.customerId,
      simulation_type: params.simulationType,
      input_params: {
        loan_amount: params.loanAmount,
        interest_rate: params.interestRate,
        tenure_months: params.tenureMonths,
        income_delta_percent: params.incomeDeltaPercent,
        expense_reduction_amount: params.expenseReductionAmount,
        monthly_savings_increase: params.monthlySavingsIncrease,
      },
      current_metrics: {
        monthly_income: currentIncome,
        monthly_expenses: currentExpenses,
        monthly_savings: currentSavings,
        monthly_emi: currentEmi,
        monthly_surplus: currentSurplus,
        debt_burden_percent: currentDebtBurden,
        financial_health_score: currentHealthScore,
        stress_level: currentStressLevel,
      },
      simulated_metrics: {
        monthly_income: simIncome,
        monthly_expenses: simExpenses,
        monthly_savings: simSavings,
        monthly_emi: simEmi,
        monthly_surplus: simSurplus,
        debt_burden_percent: simDebtBurden,
        financial_health_score: simHealthScore,
        stress_level: simStressLevel,
        new_emi_amount: newEmiAmount,
      },
      safety_assessment: assessment,
      ai_guidance: guidance,
      created_at: new Date().toISOString(),
    };

    db.insert('what_if_simulations', result);
    return result;
  }
}

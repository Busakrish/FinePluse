import { db } from '../db/database.js';
import { FinancialTwin, Transaction } from '../db/types.js';
import { BehavioralEngine } from '../engines/behavioral.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { RecommendationEngine } from '../engines/recommendation.js';
import { NextBestActionEngine } from '../safety/nextBestAction.js';

export class FinancialTwinManager {
  /**
   * Re-evaluates and updates the customer's AI Financial Twin in real-time
   * upon any financial event (such as a simulated UPI payment or salary credit).
   */
  public static refreshTwin(customerId: string): FinancialTwin {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      throw new Error(`Profile not found for: ${customerId}`);
    }

    const behavioral = BehavioralEngine.analyzeCustomer(customerId);
    const stress = FinancialStressEngine.evaluateStress(customerId);
    const nextBest = NextBestActionEngine.determineAction(customerId);

    // Compute Deterministic Financial Health Score (0-100) (Section 16)
    // Savings score (up to 35) + EMI safety score (up to 35) + Liquid buffer score (up to 20) + Income stability (up to 10)
    let savingsScore = Math.min(35, Math.max(0, (behavioral.savings_ratio / 30) * 35));
    let emiScore = Math.min(35, Math.max(0, (1 - behavioral.emi_to_income_ratio / 60) * 35));
    let bufferScore = stress.stress_level === 'HIGH' ? 5 : stress.stress_level === 'MEDIUM' ? 12 : 20;
    let stabilityScore = behavioral.income_stability_score ? 10 : 8;

    let computedHealthScore = Math.round(savingsScore + emiScore + bufferScore + stabilityScore);
    if (stress.stress_level === 'HIGH' || profile.persona_tag === 'STRESS') {
      computedHealthScore = Math.min(computedHealthScore, 38); // Stressed capped at 38
    }

    let healthTier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'STRESSED' | 'CRITICAL' = 'GOOD';
    if (computedHealthScore >= 80) healthTier = 'EXCELLENT';
    else if (computedHealthScore >= 60) healthTier = 'GOOD';
    else if (computedHealthScore >= 45) healthTier = 'FAIR';
    else if (computedHealthScore >= 30) healthTier = 'STRESSED';
    else healthTier = 'CRITICAL';

    const existingTwin = db.findOne('financial_twins', (t) => t.customer_id === customerId);

    const updatedTwin: FinancialTwin = {
      id: existingTwin ? existingTwin.id : `twin_${customerId}`,
      customer_id: customerId,
      monthly_income: behavioral.monthly_income,
      monthly_expenses: behavioral.monthly_expenses,
      monthly_savings: behavioral.monthly_savings,
      monthly_emi_burden: behavioral.monthly_emi_burden,
      savings_ratio: behavioral.savings_ratio,
      expense_ratio: behavioral.expense_ratio,
      emi_to_income_ratio: behavioral.emi_to_income_ratio,
      savings_growth_rate: behavioral.savings_growth_rate,
      financial_health_score: computedHealthScore,
      financial_health_tier: healthTier,
      stress_level: stress.stress_level,
      stress_score: stress.stress_score,
      behavioral_segment: behavioral.behavioral_segment,
      dont_sell_me_active: stress.dont_sell_me_engaged,
      guardian_status: nextBest.guardian_status,
      last_evaluated_at: new Date().toISOString(),
    };

    if (existingTwin) {
      db.update('financial_twins', existingTwin.id, updatedTwin);
    } else {
      db.insert('financial_twins', updatedTwin);
    }

    return updatedTwin;
  }
}

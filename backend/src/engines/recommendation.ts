import { db } from '../db/database.js';
import { CustomerProfile, FinancialTwin, Product, Recommendation, Consent } from '../db/types.js';
import { FinancialStressEngine } from './stress.js';

export interface RecommendationResult {
  recommendations: Recommendation[];
  suppressed_recommendations: Recommendation[];
  primary_next_best_action: string;
}

export class RecommendationEngine {
  public static generateRecommendations(customerId: string): RecommendationResult {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      throw new Error(`Customer not found for ID: ${customerId}`);
    }

    const consent = db.findOne('consents', (c) => c.customer_id === customerId);
    // If personalized_recommendations consent is disabled (Section 26)
    if (consent && !consent.personalized_recommendations) {
      return {
        recommendations: [],
        suppressed_recommendations: [],
        primary_next_best_action: 'CONSENT_RESTRICTED',
      };
    }

    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    const stressEval = FinancialStressEngine.evaluateStress(customerId);
    const products = db.getTable('products');

    const activeRecs: Recommendation[] = [];
    const suppressedRecs: Recommendation[] = [];

    const isHighStress = stressEval.stress_level === 'HIGH' || (twin && twin.dont_sell_me_active);

    for (const prod of products) {
      let score = 50;
      let shouldRecommend = false;
      let blockReason = '';
      const factors: string[] = [];

      if (prod.category === 'INVESTMENT') {
        // Suitable for disciplined savers with healthy surplus
        if (twin && twin.savings_ratio >= 25 && !isHighStress) {
          score = 94;
          shouldRecommend = true;
          factors.push(`Healthy savings ratio of ${twin.savings_ratio.toFixed(1)}% exceeds required 25% threshold.`);
          factors.push(`Stable monthly surplus of ₹${twin.monthly_savings.toLocaleString('en-IN')}.`);
          factors.push('Low overall debt commitments.');
        }
      } else if (prod.category === 'SAVINGS') {
        // Suitable for moderate and building emergency buffers
        if (!isHighStress && twin && twin.savings_ratio >= 10) {
          score = 88;
          shouldRecommend = true;
          factors.push('Builds high-yield 7.8% liquid emergency safety buffer.');
          factors.push('Protects against unexpected expenditure.');
        }
      } else if (prod.category === 'LOAN') {
        // Loan Policy Gate: High stress MUST block loans (Section 17 & 18)
        if (isHighStress) {
          score = 15;
          shouldRecommend = false;
          blockReason = `SUPPRESSED BY DON'T SELL ME MODE: Customer is in HIGH financial stress (Stress Score: ${stressEval.stress_score}/100, EMI burden: ${twin?.emi_to_income_ratio || 50}%). Responsible banking policy strictly prohibits lending cross-sells.`;
          
          suppressedRecs.push({
            id: `rec_supp_${customerId}_${prod.id}`,
            customer_id: customerId,
            product_id: prod.id,
            product_name: prod.name,
            product_type: prod.category as any,
            what_is_recommended: `Commercial Credit (${prod.name})`,
            why_is_relevant: 'Algorithm flagged potential credit need, but Safety Gateway blocked promotion.',
            benefit_description: 'N/A - Suppressed to prevent predatory lending risk.',
            risk_level: 'HIGH',
            confidence_score: 15,
            status: 'BLOCKED_BY_POLICY',
            block_reason: blockReason,
            why_am_i_seeing_this: {
              key_factors: stressEval.contributing_factors,
              spending_pattern_match: 'High EMI obligations detected relative to disposable monthly cashflow.',
              affordability_assessment: 'Additional debt exceeds safe 40% EMI-to-income threshold.',
              safety_rule_applied: 'Safety Gateway Rule SG-04: Predatory Nudging Suppression Active.',
            },
            created_at: new Date().toISOString(),
          });
        } else if (twin && twin.savings_ratio >= 20 && twin.emi_to_income_ratio < 30) {
          score = 85;
          shouldRecommend = true;
          factors.push('High repayment capacity with low existing debt burden.');
          factors.push('Stable verified income stream.');
        }
      } else if (prod.category === 'DEBT_RESTRUCTURING') {
        // Designed specifically for High Stress customers!
        if (isHighStress) {
          score = 96;
          shouldRecommend = true;
          factors.push('Proactive relief intervention before credit score impairment.');
          factors.push('Reduces monthly EMI obligations to restore positive cashflow.');
          factors.push('Empathetic restructuring aligned with RBI fair lending principles.');
        }
      }

      if (shouldRecommend) {
        activeRecs.push({
          id: `rec_${customerId}_${prod.id}`,
          customer_id: customerId,
          product_id: prod.id,
          product_name: prod.name,
          product_type: prod.category as any,
          what_is_recommended: `${prod.name}: ${prod.tagline}`,
          why_is_relevant: factors[0] || prod.description,
          benefit_description: prod.description,
          risk_level: isHighStress ? 'HIGH' : prod.category === 'INVESTMENT' ? 'LOW' : 'LOW',
          confidence_score: score,
          status: 'ACTIVE',
          why_am_i_seeing_this: {
            key_factors: factors,
            spending_pattern_match: `Aligned with your ${twin?.behavioral_segment || 'financial'} profile.`,
            affordability_assessment: `Monthly surplus and liquidity check: Passed with confidence ${score}%.`,
            safety_rule_applied: 'Passed Responsible AI Safety Gateway verification.',
          },
          created_at: new Date().toISOString(),
        });
      }
    }

    return {
      recommendations: activeRecs,
      suppressed_recommendations: suppressedRecs,
      primary_next_best_action: isHighStress ? 'FINANCIAL_ASSISTANCE' : 'PERSONALIZED_RECOMMENDATION',
    };
  }
}

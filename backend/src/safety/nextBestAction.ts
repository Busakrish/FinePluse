import { db } from '../db/database.js';
import { CustomerProfile, FinancialTwin } from '../db/types.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { FraudEngine } from '../engines/fraud.js';
import { RecommendationEngine } from '../engines/recommendation.js';

export interface NextBestActionOutcome {
  action_type: 'RECOMMEND' | 'ASSIST' | 'WARN' | 'PROTECT' | 'GUIDE' | 'STAY_SILENT';
  guardian_status: 'RECOMMEND' | 'HELP' | 'WARN' | 'PROTECT' | 'STAY_SILENT';
  title: string;
  message: string;
  action_cta: string;
  action_route: string;
  dont_sell_me_active: boolean;
  factors: string[];
  priority_order: string[];
}

export class NextBestActionEngine {
  public static determineAction(customerId: string): NextBestActionOutcome {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      throw new Error(`Profile not found for: ${customerId}`);
    }

    const consent = db.findOne('consents', (c) => c.customer_id === customerId);
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    const stressEval = FinancialStressEngine.evaluateStress(customerId);
    const fraudAlerts = db.filter('fraud_alerts', (f) => f.customer_id === customerId && f.status === 'PENDING_REVIEW');

    const priorityOrder = [
      '1. DPDPA Consent Check',
      '2. Fraud & Security Protection',
      '3. Financial Stress & Vulnerability (Don\'t Sell Me Mode)',
      '4. Cashflow & Liquidity Affordability',
      '5. Goal-Driven Personalization',
    ];

    // Priority 1: DPDPA Consent
    if (consent && !consent.financial_health_analysis && !consent.personalized_recommendations) {
      return {
        action_type: 'STAY_SILENT',
        guardian_status: 'STAY_SILENT',
        title: 'Privacy Mode Active',
        message: 'Personalization and health analysis are paused per your consent preferences.',
        action_cta: 'Manage Consents',
        action_route: '/consent',
        dont_sell_me_active: false,
        factors: ['User disabled AI processing permissions in Consent Center.'],
        priority_order: priorityOrder,
      };
    }

    // Priority 2: Fraud & Anomaly Protection
    if (fraudAlerts.length > 0) {
      const topAlert = fraudAlerts[0];
      return {
        action_type: 'PROTECT',
        guardian_status: 'PROTECT',
        title: 'Financial Guardian: High-Risk Anomaly Flagged',
        message: `Unusual transaction of ₹${topAlert.amount.toLocaleString('en-IN')} flagged for security verification.`,
        action_cta: 'Review Security Alert',
        action_route: '/fraud-security',
        dont_sell_me_active: false,
        factors: topAlert.anomaly_factors,
        priority_order: priorityOrder,
      };
    }

    // Priority 3: Financial Stress -> Don't Sell Me Mode & Empathetic Assistance (SAFETY OVERRIDES SALES)
    if (stressEval.stress_level === 'HIGH' || (twin && twin.dont_sell_me_active)) {
      return {
        action_type: 'ASSIST',
        guardian_status: 'HELP',
        title: 'Don\'t Sell Me Mode Active: Financial Support & Relief',
        message: 'We noticed a heavy EMI burden and sharp drop in savings. Loan cross-selling is paused. We are ready to assist with easy restructuring.',
        action_cta: 'Explore Samadhan Relief Plan',
        action_route: '/stress-assistance',
        dont_sell_me_active: true,
        factors: stressEval.contributing_factors,
        priority_order: priorityOrder,
      };
    }

    // Priority 4: Moderate Stress / Caution
    if (stressEval.stress_level === 'MEDIUM') {
      return {
        action_type: 'GUIDE',
        guardian_status: 'WARN',
        title: 'Build Your Emergency Reserve',
        message: 'Automate a 5% monthly recurring deposit to insulate your family from unexpected household expenses.',
        action_cta: 'Set Up Liquid Buffer',
        action_route: '/recommendations',
        dont_sell_me_active: false,
        factors: stressEval.contributing_factors,
        priority_order: priorityOrder,
      };
    }

    // Priority 5: Healthy Customer -> Hyper-Personalized Wealth Building / Investment
    const recResult = RecommendationEngine.generateRecommendations(customerId);
    const topRec = recResult.recommendations[0];

    return {
      action_type: 'RECOMMEND',
      guardian_status: 'RECOMMEND',
      title: topRec ? topRec.product_name : 'Smart Wealth SIP',
      message: topRec ? topRec.what_is_recommended : 'You have maintained an exemplary 41% savings ratio. Explore tax-efficient growth options.',
      action_cta: 'Explore Opportunity',
      action_route: '/recommendations',
      dont_sell_me_active: false,
      factors: topRec ? topRec.why_am_i_seeing_this.key_factors : ['Healthy liquidity', 'Strong savings track record'],
      priority_order: priorityOrder,
    };
  }
}

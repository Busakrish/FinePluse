import { db } from '../db/database.js';
import { SpendingAnalysisEngine, SpendingAnalysisPayload } from '../utils/spendingAnalysis.js';

export interface SpendingCoachServiceResponse {
  customer_id: string;
  consent_restricted: boolean;
  data: SpendingAnalysisPayload | null;
  generated_at: string;
}

export class SpendingCoachService {
  /**
   * Generates AI Spending Coach analytics for a verified customer.
   * Strictly enforces DPDPA 2023 Consent Center rules and Fair Lending guidelines.
   */
  public static getCoachData(customerId: string): SpendingCoachServiceResponse {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      return {
        customer_id: customerId,
        consent_restricted: false,
        data: null,
        generated_at: new Date().toISOString(),
      };
    }

    const consent = db.findOne('consents', (c) => c.customer_id === customerId);

    // DPDPA Consent Check:
    // If user has disabled transaction analysis or personalized recommendations,
    // suppress spending coaching insights in accordance with privacy rules.
    if (consent && (!consent.transaction_analysis || !consent.personalized_recommendations)) {
      return {
        customer_id: customerId,
        consent_restricted: true,
        data: null,
        generated_at: new Date().toISOString(),
      };
    }

    const transactions = db.filter('transactions', (t) => t.customer_id === customerId);
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);

    const analysis = SpendingAnalysisEngine.analyze(
      transactions,
      twin,
      profile.monthly_income || 50000
    );

    return {
      customer_id: customerId,
      consent_restricted: false,
      data: analysis,
      generated_at: new Date().toISOString(),
    };
  }
}

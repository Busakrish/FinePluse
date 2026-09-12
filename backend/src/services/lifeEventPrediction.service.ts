import { db } from '../db/database.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { LifeEventRules, LifeEventPrediction, CustomerContextForRules } from '../utils/lifeEventRules.js';

export interface LifeEventPredictionResponse {
  customer_id: string;
  consent_restricted: boolean;
  predictions: LifeEventPrediction[];
  generated_at: string;
}

export class LifeEventPredictionService {
  /**
   * Predicts upcoming financial life events based purely on verified customer banking data.
   * Enforces DPDPA 2023 Consent Center rules and RBI Fair Lending anti-predatory boundaries.
   */
  public static predictForCustomer(customerId: string): LifeEventPredictionResponse {
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
      return {
        customer_id: customerId,
        consent_restricted: false,
        predictions: [],
        generated_at: new Date().toISOString(),
      };
    }

    const consent = db.findOne('consents', (c) => c.customer_id === customerId);

    // DPDPA Consent Check (Section 21 & 22):
    // If user disabled personalized recommendations, suppress all life event predictions!
    if (consent && !consent.personalized_recommendations) {
      return {
        customer_id: customerId,
        consent_restricted: true,
        predictions: [],
        generated_at: new Date().toISOString(),
      };
    }

    const account = db.findOne('accounts', (a) => a.customer_id === customerId);
    const transactions = db.filter('transactions', (t) => t.customer_id === customerId);
    const loans = db.filter('loans', (l) => l.customer_id === customerId);
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    const stress = FinancialStressEngine.evaluateStress(customerId);

    const ctx: CustomerContextForRules = {
      customerId,
      profile,
      account,
      transactions,
      loans,
      twin,
      stress,
      consent,
    };

    const evaluated: (LifeEventPrediction | null)[] = [
      // Priority 1: Financial Stress (Takes precedence if active)
      LifeEventRules.evaluateFinancialStress(ctx),
      // Event 1: First Salary / Career Growth
      LifeEventRules.evaluateFirstSalary(ctx),
      // Event 2: Home Buyer Journey
      LifeEventRules.evaluateHomeBuyer(ctx),
      // Event 3: Marriage & Milestone Planning
      LifeEventRules.evaluateMarriage(ctx),
      // Event 4: Child Education
      LifeEventRules.evaluateEducation(ctx),
      // Event 5: Health & Family Protection
      LifeEventRules.evaluateHealthProtection(ctx),
      // Event 6: Vehicle Purchase Journey
      LifeEventRules.evaluateVehicle(ctx),
      // Event 7: Travel Goal Detection
      LifeEventRules.evaluateTravel(ctx),
    ];

    // Filter out nulls and sort by confidence score descending
    const validPredictions = evaluated
      .filter((p): p is LifeEventPrediction => p !== null)
      .sort((a, b) => b.confidence_score - a.confidence_score);

    return {
      customer_id: customerId,
      consent_restricted: false,
      predictions: validPredictions,
      generated_at: new Date().toISOString(),
    };
  }
}

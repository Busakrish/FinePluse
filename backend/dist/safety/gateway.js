import { db } from '../db/database.js';
import { FinancialStressEngine } from '../engines/stress.js';
export class SafetyPolicyGateway {
    /**
     * Enforces RBI/Responsible AI policy rules before ANY recommendation reaches the user.
     */
    static evaluateRecommendation(customerId, proposedProductType) {
        const profile = db.findById('customer_profiles', customerId);
        if (!profile) {
            return {
                allowed: false,
                policy_decision: 'SUPPRESSED_DONT_SELL_ME',
                reasons: ['Customer profile not found'],
                suggested_action: 'NO_ACTION',
                dont_sell_me_mode: false,
            };
        }
        const consent = db.findOne('consents', (c) => c.customer_id === customerId);
        const stressEval = FinancialStressEngine.evaluateStress(customerId);
        const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
        const reasons = [];
        // STEP 1: Consent Verification (DPDPA)
        if (consent && !consent.personalized_recommendations) {
            return {
                allowed: false,
                policy_decision: 'SUPPRESSED_DONT_SELL_ME',
                reasons: ['User has disabled personalized recommendations in Consent Center (DPDPA compliant).'],
                suggested_action: 'NO_ACTION',
                dont_sell_me_mode: false,
            };
        }
        // STEP 2 & 4: Anti-Predatory Rule / Don't Sell Me Mode (Section 18 & 28)
        // If Financial Stress is HIGH, NEVER allow commercial lending cross-sells!
        if (stressEval.stress_level === 'HIGH' || (twin && twin.dont_sell_me_active)) {
            if (proposedProductType === 'LOAN' || proposedProductType === 'CREDIT_CARD') {
                const blockLog = {
                    allowed: false,
                    policy_decision: 'SUPPRESSED_DONT_SELL_ME',
                    reasons: [
                        'SAFETY GATEWAY INTERCEPT: Customer is experiencing HIGH financial stress (Score: ' + stressEval.stress_score + '/100).',
                        'Savings decline rate: ' + (twin?.savings_growth_rate || -45) + '%.',
                        'EMI burden exceeds safe debt threshold (>= 50%).',
                        'Don\'t Sell Me Mode engaged: Commercial loan marketing suppressed to prevent debt trap.',
                    ],
                    suggested_action: 'ASSIST',
                    dont_sell_me_mode: true,
                };
                // Record policy block in audit logs
                db.logAudit({
                    customer_id: customerId,
                    event_type: 'POLICY_GATEWAY_BLOCK',
                    ai_engine: 'SAFETY_GATEWAY',
                    input_summary: { proposed_product: proposedProductType, stress_score: stressEval.stress_score },
                    engine_output: { block_action: 'SUPPRESSED_DONT_SELL_ME' },
                    policy_decision: 'SUPPRESSED_DONT_SELL_ME',
                    final_action_taken: 'Blocked loan promotion; Triggered Don\'t Sell Me Mode and Financial Assistance.',
                });
                return blockLog;
            }
        }
        // STEP 3: Affordability Check
        if (proposedProductType === 'INVESTMENT' && twin && twin.savings_ratio < 15) {
            return {
                allowed: false,
                policy_decision: 'MODIFIED',
                reasons: ['Savings surplus is below investment threshold. Prioritize emergency liquid fund first.'],
                suggested_action: 'GUIDE',
                dont_sell_me_mode: false,
            };
        }
        // Pass through
        return {
            allowed: true,
            policy_decision: 'ALLOWED',
            reasons: ['Passed all responsible banking, consent, liquidity and anti-predatory criteria.'],
            suggested_action: 'RECOMMEND',
            dont_sell_me_mode: false,
        };
    }
}

import { db } from '../db/database.js';
export class FinancialStressEngine {
    static evaluateStress(customerId) {
        const profile = db.findById('customer_profiles', customerId);
        if (!profile) {
            throw new Error(`Customer profile not found for ID: ${customerId}`);
        }
        const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
        const loans = db.filter('loans', (l) => l.customer_id === customerId);
        const account = db.findOne('accounts', (a) => a.customer_id === customerId);
        const income = twin ? twin.monthly_income : profile.monthly_income;
        const emiBurden = twin ? twin.monthly_emi_burden : 0;
        const emiRatio = twin ? twin.emi_to_income_ratio : (emiBurden / (income || 1)) * 100;
        const savingsDelta = twin ? twin.savings_growth_rate : 0;
        const liquidBalance = account ? account.balance : 5000;
        const monthlyExpenses = twin ? twin.monthly_expenses : 20000;
        const missedEmis = loans.reduce((acc, l) => acc + (l.missed_emis_count || 0), 0);
        const hasOverdueLoan = loans.some((l) => l.status === 'OVERDUE');
        let emiPenalty = 0;
        let savingsPenalty = 0;
        let missedPenalty = 0;
        let bufferPenalty = 0;
        const factors = [];
        // 1. EMI Burden Penalty (Safe threshold <= 35%, danger >= 50%)
        if (emiRatio >= 50) {
            emiPenalty = 35;
            factors.push(`Severe EMI burden: ${emiRatio.toFixed(1)}% of income consumed by loan repayments.`);
        }
        else if (emiRatio >= 35) {
            emiPenalty = 20;
            factors.push(`Elevated EMI commitment: ${emiRatio.toFixed(1)}% of monthly earnings.`);
        }
        // 2. Savings Drop Penalty
        if (savingsDelta <= -30) {
            savingsPenalty = 30;
            factors.push(`Sharp drop in monthly savings (${savingsDelta}% decline vs previous benchmark).`);
        }
        else if (savingsDelta < 0) {
            savingsPenalty = 15;
            factors.push(`Declining savings trajectory (${savingsDelta}%).`);
        }
        // 3. Missed or Overdue Payments Penalty
        if (missedEmis > 0 || hasOverdueLoan) {
            missedPenalty = 25;
            factors.push(`Recent missed or overdue EMI detected (${missedEmis} overdue event).`);
        }
        // 4. Liquid Buffer Penalty
        const bufferMonths = liquidBalance / (monthlyExpenses || 1);
        if (bufferMonths < 0.5) {
            bufferPenalty = 15;
            factors.push(`Critical liquidity shortage: Liquid balance (₹${liquidBalance.toLocaleString('en-IN')}) covers < 15 days of expenses.`);
        }
        else if (bufferMonths < 1.5) {
            bufferPenalty = 8;
            factors.push(`Low liquidity buffer: Emergency fund covers only ${bufferMonths.toFixed(1)} months.`);
        }
        const totalScore = Math.min(100, Math.max(0, emiPenalty + savingsPenalty + missedPenalty + bufferPenalty + 5));
        let stressLevel = 'LOW';
        let dontSellMe = false;
        let supportAction = 'Maintain disciplined budgeting and build high-yield emergency reserves.';
        if (totalScore >= 65 || profile.persona_tag === 'STRESS') {
            stressLevel = 'HIGH';
            dontSellMe = true;
            supportAction = 'Activate Don\'t Sell Me Mode: Suppress loan marketing, offer Samadhan EMI restructuring, and connect with empathetic financial counselor.';
        }
        else if (totalScore >= 35) {
            stressLevel = 'MEDIUM';
            supportAction = 'Suggest automated expense categorization and liquid emergency fund builder.';
        }
        return {
            stress_level: stressLevel,
            stress_score: totalScore,
            contributing_factors: factors.length > 0 ? factors : ['Healthy cashflow and low debt obligations.'],
            recommended_support_action: supportAction,
            dont_sell_me_engaged: dontSellMe,
            score_breakdown: {
                emi_burden_penalty: emiPenalty,
                savings_drop_penalty: savingsPenalty,
                missed_payments_penalty: missedPenalty,
                liquid_buffer_penalty: bufferPenalty,
            },
        };
    }
}

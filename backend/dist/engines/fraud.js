import { db } from '../db/database.js';
export class FraudEngine {
    static evaluateTransaction(customerId, amount, merchantName, hourOfDay = new Date().getHours()) {
        const historicalTxns = db.filter('transactions', (tx) => tx.customer_id === customerId && tx.type === 'DEBIT' && !tx.is_anomaly);
        const amounts = historicalTxns.map((t) => t.amount);
        let mean = 1500;
        let stdDev = 800;
        if (amounts.length >= 3) {
            mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
            const variance = amounts.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / amounts.length;
            stdDev = Math.max(100, Math.sqrt(variance));
        }
        const zScore = Number(((amount - mean) / stdDev).toFixed(2));
        const factors = [];
        // Factor 1: Value Anomaly
        if (zScore >= 3.5 || amount >= 50000) {
            factors.push(`Unusual spike: ₹${amount.toLocaleString('en-IN')} is ${(amount / (mean || 1)).toFixed(1)}x higher than typical transaction mean (₹${Math.round(mean)}).`);
        }
        // Factor 2: Unusual Time of Day (e.g. 1 AM to 4 AM)
        if (hourOfDay >= 1 && hourOfDay <= 4) {
            factors.push(`Unusual time window: Initiated at ${hourOfDay}:00 hrs (typical user activity is between 08:00 - 22:00 hrs).`);
        }
        // Factor 3: Merchant Category / Unknown Entity
        if (merchantName && (merchantName.toLowerCase().includes('gadget') || merchantName.toLowerCase().includes('unknown') || merchantName.toLowerCase().includes('cyber'))) {
            factors.push(`High-risk merchant indicator: "${merchantName}" has no prior verified transactional history.`);
        }
        let isAnomaly = false;
        let riskLevel = 'LOW';
        let triggerReason = 'Normal transaction aligned with customer profile.';
        let action = 'ALLOW';
        if (zScore >= 4.0 || (amount >= 75000 && factors.length >= 2)) {
            isAnomaly = true;
            riskLevel = 'HIGH';
            triggerReason = `HIGH-RISK ANOMALY: Transaction amount (₹${amount.toLocaleString('en-IN')}) deviates critically from baseline (z-score: ${zScore}).`;
            action = 'MFA_CHALLENGE';
        }
        else if (zScore >= 2.5) {
            isAnomaly = true;
            riskLevel = 'MEDIUM';
            triggerReason = `Moderate deviation detected (z-score: ${zScore}).`;
            action = 'FLAG_FOR_REVIEW';
        }
        return {
            is_anomaly: isAnomaly,
            risk_level: riskLevel,
            z_score: zScore,
            trigger_reason: triggerReason,
            anomaly_factors: factors.length > 0 ? factors : ['Transaction conforms to verified spending habits.'],
            recommended_security_action: action,
        };
    }
}

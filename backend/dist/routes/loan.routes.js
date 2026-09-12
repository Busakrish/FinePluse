import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { WhatIfEngine } from '../engines/whatif.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { SafetyPolicyGateway } from '../safety/gateway.js';
const router = Router();
// GET /api/loans/my
router.get('/my', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile.' });
    const loans = db.filter('loans', (l) => l.customer_id === customerId);
    return res.json({ success: true, loans });
});
// POST /api/loans/simulate-journey (Simulated 10-step loan application check)
router.post('/simulate-journey', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile.' });
    const { loanType = 'PERSONAL', principalAmount = 200000, tenureMonths = 24, purpose = 'Home Renovation' } = req.body;
    const numPrincipal = Number(principalAmount);
    const numTenure = Number(tenureMonths);
    const interestRate = loanType === 'KISAN_CREDIT' ? 4.0 : loanType === 'HOME' ? 8.75 : 11.5;
    const emi = WhatIfEngine.calculateEMI(numPrincipal, interestRate, numTenure);
    // Safety Policy Gate
    const policyCheck = SafetyPolicyGateway.evaluateRecommendation(customerId, 'LOAN');
    const stressEval = FinancialStressEngine.evaluateStress(customerId);
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    const newTotalEmi = (twin?.monthly_emi_burden || 0) + emi;
    const newDebtBurden = Number(((newTotalEmi / (twin?.monthly_income || 1)) * 100).toFixed(1));
    let guidance = '';
    let status = 'ELIGIBLE_RECOMMENDED';
    if (!policyCheck.allowed || stressEval.stress_level === 'HIGH') {
        status = 'BLOCKED_HIGH_STRESS';
        guidance = 'Responsible AI Policy: Application guidance blocked due to high financial stress. We recommend exploring our Samadhan EMI relief plan instead of taking further debt.';
    }
    else if (newDebtBurden > 40) {
        status = 'CAUTION_MANAGEABLE';
        guidance = `Caution: This loan increases your EMI burden to ${newDebtBurden}%. Consider a longer tenure to reduce monthly repayment strain.`;
    }
    else {
        status = 'ELIGIBLE_RECOMMENDED';
        guidance = `Excellent affordability: The simulated EMI of ₹${emi.toLocaleString('en-IN')}/mo is well within your safe disposable cashflow buffer.`;
    }
    return res.json({
        success: true,
        simulation_details: {
            loan_type: loanType,
            principal: numPrincipal,
            tenure_months: numTenure,
            interest_rate: interestRate,
            calculated_emi: emi,
            current_emi_burden: twin?.monthly_emi_burden || 0,
            simulated_emi_burden: newTotalEmi,
            simulated_debt_burden_percent: newDebtBurden,
            stress_level: stressEval.stress_level,
            status,
            guidance,
            policy_evaluation: policyCheck,
        },
    });
});
export default router;

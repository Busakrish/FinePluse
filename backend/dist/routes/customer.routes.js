import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireCustomerIsolation } from '../middleware/auth.js';
import { FinancialTwinManager } from '../twin/twinManager.js';
const router = Router();
// GET /api/customers/me
router.get('/me', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId) {
        return res.status(400).json({ success: false, error: 'No associated customer profile.' });
    }
    const profile = db.findById('customer_profiles', customerId);
    const account = db.findOne('accounts', (a) => a.customer_id === customerId);
    const consent = db.findOne('consents', (c) => c.customer_id === customerId);
    // Sync twin
    const twin = FinancialTwinManager.refreshTwin(customerId);
    return res.json({
        success: true,
        profile,
        account,
        consent,
        twin,
    });
});
// GET /api/customers/:customerId (With customer isolation check)
router.get('/:customerId', authenticate, requireCustomerIsolation, (req, res) => {
    const customerId = req.params.customerId;
    const profile = db.findById('customer_profiles', customerId);
    if (!profile) {
        return res.status(404).json({ success: false, error: 'Customer not found.' });
    }
    const account = db.findOne('accounts', (a) => a.customer_id === customerId);
    const twin = db.findOne('financial_twins', (t) => t.customer_id === customerId);
    return res.json({
        success: true,
        profile,
        account,
        twin,
    });
});
// GET /api/customers/accounts
router.get('/accounts/my', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile.' });
    const accounts = db.filter('accounts', (a) => a.customer_id === customerId);
    return res.json({ success: true, accounts });
});
// GET /api/customers/goals
router.get('/goals/my', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile.' });
    const goals = db.filter('financial_goals', (g) => g.customer_id === customerId);
    return res.json({ success: true, goals });
});
// POST /api/customers/goals
router.post('/goals', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile.' });
    const { title, category, targetAmount, targetDate, monthlyContribution } = req.body;
    const newGoal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        customer_id: customerId,
        title: title || 'New Savings Goal',
        category: category || 'GENERAL',
        target_amount: Number(targetAmount) || 100000,
        current_amount: 0,
        target_date: targetDate || '2027-12-31',
        monthly_contribution: Number(monthlyContribution) || 2000,
        status: 'IN_PROGRESS',
        created_at: new Date().toISOString(),
    };
    db.insert('financial_goals', newGoal);
    return res.json({ success: true, goal: newGoal });
});
export default router;

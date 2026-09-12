import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
const router = Router();
// GET /api/admin/decision-stream
router.get('/decision-stream', authenticate, requireAdmin, (req, res) => {
    const customers = db.getTable('customer_profiles');
    const twins = db.getTable('financial_twins');
    const recs = db.getTable('recommendations');
    const auditLogs = db.getTable('audit_logs');
    const fraudAlerts = db.getTable('fraud_alerts');
    const stressAlerts = db.getTable('stress_alerts');
    // Build live decision stream for all personas
    const liveDecisions = customers.map((c) => {
        const twin = twins.find((t) => t.customer_id === c.id);
        const activeRec = recs.find((r) => r.customer_id === c.id && r.status === 'ACTIVE');
        const blockedRec = recs.find((r) => r.customer_id === c.id && r.status === 'BLOCKED_BY_POLICY');
        const fraud = fraudAlerts.find((f) => f.customer_id === c.id);
        return {
            customer_id: c.id,
            customer_name: c.full_name,
            persona_tag: c.persona_tag,
            monthly_income: c.monthly_income,
            health_score: twin?.financial_health_score || 70,
            stress_level: twin?.stress_level || 'LOW',
            dont_sell_me_active: twin?.dont_sell_me_active || false,
            guardian_status: twin?.guardian_status || 'RECOMMEND',
            ai_proposed_action: blockedRec ? blockedRec.product_name : activeRec ? activeRec.product_name : 'Maintain Liquid Buffer',
            safety_gateway_decision: blockedRec ? 'BLOCKED_BY_POLICY' : 'APPROVED',
            block_reason: blockedRec?.block_reason || 'N/A - Complies with responsible lending standards',
            final_delivered_action: blockedRec ? 'Samadhan Debt Restructuring & Assistance' : activeRec ? activeRec.what_is_recommended : 'General Financial Guidance',
            has_fraud_alert: !!fraud,
        };
    });
    return res.json({
        success: true,
        total_customers: customers.length,
        active_dont_sell_me_count: twins.filter((t) => t.dont_sell_me_active).length,
        high_stress_count: twins.filter((t) => t.stress_level === 'HIGH').length,
        fraud_alerts_count: fraudAlerts.filter((f) => f.status === 'PENDING_REVIEW').length,
        decisions: liveDecisions,
    });
});
// GET /api/admin/audit-logs
router.get('/audit-logs', authenticate, requireAdmin, (req, res) => {
    const logs = db.getTable('audit_logs');
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return res.json({ success: true, count: sorted.length, audit_logs: sorted });
});
export default router;

import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();
// GET /api/consents/my
router.get('/my', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile found.' });
    let consent = db.findOne('consents', (c) => c.customer_id === customerId);
    if (!consent) {
        consent = {
            id: `con_${customerId}`,
            customer_id: customerId,
            transaction_analysis: true,
            financial_health_analysis: true,
            personalized_recommendations: true,
            marketing_personalization: true,
            updated_at: new Date().toISOString(),
        };
        db.insert('consents', consent);
    }
    return res.json({ success: true, consent });
});
// PUT /api/consents/update
router.put('/update', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile found.' });
    const { transaction_analysis, financial_health_analysis, personalized_recommendations, marketing_personalization, } = req.body;
    const existing = db.findOne('consents', (c) => c.customer_id === customerId);
    if (!existing) {
        return res.status(404).json({ success: false, error: 'Consent profile not found.' });
    }
    const updated = db.update('consents', existing.id, {
        transaction_analysis: typeof transaction_analysis === 'boolean' ? transaction_analysis : existing.transaction_analysis,
        financial_health_analysis: typeof financial_health_analysis === 'boolean' ? financial_health_analysis : existing.financial_health_analysis,
        personalized_recommendations: typeof personalized_recommendations === 'boolean' ? personalized_recommendations : existing.personalized_recommendations,
        marketing_personalization: typeof marketing_personalization === 'boolean' ? marketing_personalization : existing.marketing_personalization,
    });
    // Log Privacy & Consent change audit
    db.logAudit({
        customer_id: customerId,
        event_type: 'CONSENT_CHANGE',
        ai_engine: 'SAFETY_GATEWAY',
        input_summary: req.body,
        engine_output: { updated_consent: updated },
        policy_decision: 'ALLOWED',
        final_action_taken: 'Updated DPDPA consent preferences and recalculated active AI processing permissions.',
    });
    return res.json({
        success: true,
        message: 'DPDPA consent preferences updated successfully.',
        consent: updated,
    });
});
export default router;

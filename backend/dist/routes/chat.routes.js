import { Router } from 'express';
import { db } from '../db/database.js';
import { authenticate } from '../middleware/auth.js';
import { VernacularEngine } from '../engines/vernacular.js';
const router = Router();
// POST /api/chat
router.post('/', authenticate, (req, res) => {
    const customerId = req.user?.customerId;
    if (!customerId)
        return res.status(400).json({ success: false, error: 'No customer profile found.' });
    const { message, language } = req.body;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ success: false, error: 'Message text is required.' });
    }
    // Process via Vernacular Engine with Verified Backend Data Pipeline
    const response = VernacularEngine.processQuery(customerId, message, language);
    // Store chat message in session
    const chatMsgUser = {
        id: `msg_u_${Date.now()}`,
        session_id: `ses_${customerId}`,
        sender: 'USER',
        content: message,
        intent_detected: response.intent,
        language: response.language,
        created_at: new Date().toISOString(),
    };
    const chatMsgBot = {
        id: `msg_a_${Date.now() + 1}`,
        session_id: `ses_${customerId}`,
        sender: 'ASSISTANT',
        content: response.message,
        intent_detected: response.intent,
        verified_data_used: response.verified_data,
        language: response.language,
        created_at: new Date().toISOString(),
    };
    db.insert('chat_messages', chatMsgUser);
    db.insert('chat_messages', chatMsgBot);
    return res.json({
        success: true,
        response: {
            message: response.message,
            language: response.language,
            intent: response.intent,
            verified_data: response.verified_data,
            suggested_actions: response.suggested_actions,
        },
    });
});
export default router;

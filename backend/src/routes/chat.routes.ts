import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { VernacularEngine } from '../engines/vernacular.js';

const router = Router();

// GET /api/chat/history - Retrieve recent conversation history
router.get('/history', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile found.' });

  const history = db
    .filter('chat_messages', (m) => m.session_id === `ses_${customerId}`)
    .slice(-30);

  return res.json({
    success: true,
    history,
  });
});

// POST /api/chat - Conversational Banking Assistant
router.post('/', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<any> => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile found.' });

  const { message, language } = req.body;
  if (!message || typeof message !== 'string') {
    return res.status(400).json({ success: false, error: 'Message text is required.' });
  }

  // Retrieve existing conversation history for context memory
  const previousMessages = db
    .filter('chat_messages', (m) => m.session_id === `ses_${customerId}`)
    .slice(-8)
    .map((m) => ({
      sender: m.sender as 'USER' | 'ASSISTANT',
      content: m.content,
    }));

  // Process via Vernacular Engine with Gemini 2.5 Flash & Verified Backend Data Pipeline
  const response = await VernacularEngine.processQueryWithGemini(
    customerId,
    message,
    language,
    previousMessages
  );

  // Store chat message in session
  const chatMsgUser = {
    id: `msg_u_${Date.now()}`,
    session_id: `ses_${customerId}`,
    sender: 'USER' as const,
    content: message,
    intent_detected: response.intent,
    language: response.language,
    created_at: new Date().toISOString(),
  };

  const chatMsgBot = {
    id: `msg_a_${Date.now() + 1}`,
    session_id: `ses_${customerId}`,
    sender: 'ASSISTANT' as const,
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
      deep_link: response.deep_link,
      model_used: response.model_used,
    },
  });
});

export default router;

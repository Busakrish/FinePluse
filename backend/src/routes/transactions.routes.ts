import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

const router = Router();

// GET /api/transactions
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  let customerId = req.user?.customerId;
  if (!customerId && req.user?.role === 'ADMIN') {
    customerId = 'cust_rahul';
  }
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'No customer profile associated.' });
  }

  const txns = req.user?.role === 'ADMIN' && req.query.all === 'true'
    ? db.getTable('transactions')
    : db.filter('transactions', (t) => t.customer_id === customerId);

  // Sort descending by created_at
  const sorted = [...txns].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return res.json({ success: true, count: sorted.length, transactions: sorted });
});

export default router;

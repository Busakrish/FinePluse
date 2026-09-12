import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { SpendingCoachService } from '../services/spendingCoach.service.js';

const router = Router();

// GET /api/spending/coach - Complete AI Spending Coach overview & actionable advice
router.get('/coach', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'Customer session required.' });
  }

  const result = SpendingCoachService.getCoachData(customerId);
  return res.json({
    success: true,
    ...result,
  });
});

// GET /api/spending/categories - Category breakdown with MoM comparison
router.get('/categories', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'Customer session required.' });
  }

  const result = SpendingCoachService.getCoachData(customerId);
  return res.json({
    success: true,
    customer_id: customerId,
    consent_restricted: result.consent_restricted,
    categories: result.data?.categories || [],
  });
});

// GET /api/spending/challenges - Gamified spending challenges
router.get('/challenges', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'Customer session required.' });
  }

  const result = SpendingCoachService.getCoachData(customerId);
  return res.json({
    success: true,
    customer_id: customerId,
    consent_restricted: result.consent_restricted,
    challenges: result.data?.challenges || [],
  });
});

export default router;

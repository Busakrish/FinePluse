import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { LifeEventPredictionService } from '../services/lifeEventPrediction.service.js';

const router = Router();

// GET /api/life-events - Upcoming Financial Life Events for Customer
router.get('/', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'Customer session required.' });
  }

  const result = LifeEventPredictionService.predictForCustomer(customerId);

  return res.json({
    success: true,
    ...result,
  });
});

export default router;

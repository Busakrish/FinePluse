import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { WhatIfEngine } from '../engines/whatif.js';

const router = Router();

// POST /api/what-if/simulate
router.post('/simulate', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile found.' });

  const {
    simulationType = 'TAKE_LOAN',
    loanAmount,
    interestRate,
    tenureMonths,
    incomeDeltaPercent,
    expenseReductionAmount,
    monthlySavingsIncrease,
  } = req.body;

  const simulationResult = WhatIfEngine.simulate({
    customerId,
    simulationType,
    loanAmount: Number(loanAmount),
    interestRate: Number(interestRate),
    tenureMonths: Number(tenureMonths),
    incomeDeltaPercent: Number(incomeDeltaPercent),
    expenseReductionAmount: Number(expenseReductionAmount),
    monthlySavingsIncrease: Number(monthlySavingsIncrease),
  });

  return res.json({
    success: true,
    simulation: simulationResult,
  });
});

// GET /api/what-if/history
router.get('/history', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile found.' });

  const history = db.filter('what_if_simulations', (s) => s.customer_id === customerId);
  return res.json({ success: true, history });
});

export default router;

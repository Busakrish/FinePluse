import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { BehavioralEngine } from '../engines/behavioral.js';
import { RecommendationEngine } from '../engines/recommendation.js';
import { FinancialStressEngine } from '../engines/stress.js';
import { NextBestActionEngine } from '../safety/nextBestAction.js';
import { FinancialTwinManager } from '../twin/twinManager.js';

const router = Router();

// GET /api/ai/financial-twin
router.get('/financial-twin', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const twin = FinancialTwinManager.refreshTwin(customerId);
  const behavioral = BehavioralEngine.analyzeCustomer(customerId);
  const nextBest = NextBestActionEngine.determineAction(customerId);

  return res.json({
    success: true,
    financial_twin: twin,
    behavioral_details: behavioral,
    next_best_action: nextBest,
  });
});

// GET /api/ai/financial-health
router.get('/financial-health', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const twin = FinancialTwinManager.refreshTwin(customerId);
  const stress = FinancialStressEngine.evaluateStress(customerId);

  return res.json({
    success: true,
    score: twin.financial_health_score,
    tier: twin.financial_health_tier,
    savings_ratio: twin.savings_ratio,
    emi_to_income_ratio: twin.emi_to_income_ratio,
    savings_growth_rate: twin.savings_growth_rate,
    stress_level: twin.stress_level,
    stress_score: twin.stress_score,
    stress_breakdown: stress.score_breakdown,
  });
});

// GET /api/ai/recommendations (Engine 2 + Explainable AI)
router.get('/recommendations', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const recResult = RecommendationEngine.generateRecommendations(customerId);
  return res.json({
    success: true,
    recommendations: recResult.recommendations,
    suppressed_recommendations: recResult.suppressed_recommendations,
    primary_next_best_action: recResult.primary_next_best_action,
  });
});

// GET /api/ai/stress (Engine 3 + Don't Sell Me Mode)
router.get('/stress', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const stress = FinancialStressEngine.evaluateStress(customerId);
  return res.json({
    success: true,
    stress_level: stress.stress_level,
    stress_score: stress.stress_score,
    contributing_factors: stress.contributing_factors,
    recommended_support_action: stress.recommended_support_action,
    dont_sell_me_engaged: stress.dont_sell_me_engaged,
    score_breakdown: stress.score_breakdown,
  });
});

// GET /api/ai/fraud-alerts (Engine 4)
router.get('/fraud-alerts', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const alerts = db.filter('fraud_alerts', (f) => f.customer_id === customerId);
  return res.json({ success: true, count: alerts.length, alerts });
});

// GET /api/ai/next-best-action
router.get('/next-best-action', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const action = NextBestActionEngine.determineAction(customerId);
  return res.json({ success: true, next_best_action: action });
});

// GET /api/ai/insights
router.get('/insights', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) return res.status(400).json({ success: false, error: 'No customer profile.' });

  const insights = db.filter('ai_insights', (i) => i.customer_id === customerId);
  return res.json({ success: true, insights });
});

export default router;

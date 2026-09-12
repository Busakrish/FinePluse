export interface User {
  id: string;
  email: string;
  role: 'CUSTOMER' | 'ADMIN';
  customer_id?: string;
  name: string;
  preferred_language: 'en' | 'hi' | 'gu';
  persona_tag?: 'HEALTHY' | 'MODERATE' | 'STRESS' | 'FRAUD' | 'VERNACULAR' | 'WHATIF' | 'ADMIN';
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  location_tier: string;
  city: string;
  state: string;
  preferred_language: 'en' | 'hi' | 'gu';
  occupation: string;
  monthly_income: number;
  persona_tag: string;
}

export interface Account {
  id: string;
  customer_id: string;
  account_number: string;
  ifsc_code: string;
  account_type: 'SAVINGS' | 'CURRENT' | 'SALARY';
  balance: number;
  upi_id: string;
  status: string;
}

export interface Transaction {
  id: string;
  account_id: string;
  customer_id: string;
  amount: number;
  type: 'CREDIT' | 'DEBIT';
  category: string;
  description: string;
  merchant_name?: string;
  reference_id: string;
  payment_method: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'FLAGGED';
  is_anomaly: boolean;
  created_at: string;
}

export interface FinancialTwin {
  id: string;
  customer_id: string;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  monthly_emi_burden: number;
  savings_ratio: number;
  expense_ratio: number;
  emi_to_income_ratio: number;
  savings_growth_rate: number;
  financial_health_score: number;
  financial_health_tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'STRESSED' | 'CRITICAL';
  stress_level: 'LOW' | 'MEDIUM' | 'HIGH';
  stress_score: number;
  behavioral_segment: string;
  dont_sell_me_active: boolean;
  guardian_status: 'RECOMMEND' | 'HELP' | 'WARN' | 'PROTECT' | 'STAY_SILENT';
  last_evaluated_at: string;
}

export interface Recommendation {
  id: string;
  customer_id: string;
  product_id: string;
  product_name: string;
  product_type: 'SAVINGS' | 'INVESTMENT' | 'INSURANCE' | 'CREDIT_CARD' | 'LOAN' | 'DEBT_RESTRUCTURING';
  what_is_recommended: string;
  why_is_relevant: string;
  benefit_description: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence_score: number;
  status: 'ACTIVE' | 'BLOCKED_BY_POLICY' | 'ACCEPTED' | 'DISMISSED';
  block_reason?: string;
  why_am_i_seeing_this: {
    key_factors: string[];
    spending_pattern_match: string;
    affordability_assessment: string;
    safety_rule_applied: string;
  };
  created_at: string;
}

export interface NextBestAction {
  action_type: 'RECOMMEND' | 'ASSIST' | 'WARN' | 'PROTECT' | 'GUIDE' | 'STAY_SILENT';
  guardian_status: 'RECOMMEND' | 'HELP' | 'WARN' | 'PROTECT' | 'STAY_SILENT';
  title: string;
  message: string;
  action_cta: string;
  action_route: string;
  dont_sell_me_active: boolean;
  factors: string[];
  priority_order: string[];
}

export interface Consent {
  id: string;
  customer_id: string;
  transaction_analysis: boolean;
  financial_health_analysis: boolean;
  personalized_recommendations: boolean;
  marketing_personalization: boolean;
  updated_at: string;
}

export interface FraudAlert {
  id: string;
  customer_id: string;
  transaction_id?: string;
  amount: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  trigger_reason: string;
  z_score?: number;
  anomaly_factors: string[];
  status: string;
  created_at: string;
}

export interface AIInsight {
  id: string;
  customer_id: string;
  title: string;
  summary: string;
  category: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'WARNING' | 'URGENT';
  action_type: string;
  action_payload?: any;
  created_at: string;
}

export interface FinancialGoal {
  id: string;
  customer_id: string;
  title: string;
  category: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  monthly_contribution: number;
  status: string;
}

export interface AuditLog {
  id: string;
  customer_id?: string;
  event_type: string;
  ai_engine: string;
  input_summary: any;
  engine_output: any;
  policy_decision: 'ALLOWED' | 'MODIFIED' | 'SUPPRESSED_DONT_SELL_ME' | 'FLAGGED';
  final_action_taken: string;
  timestamp: string;
}

export type LifeEventCategory =
  | 'CAREER'
  | 'HOUSING'
  | 'FAMILY'
  | 'EDUCATION'
  | 'HEALTH'
  | 'VEHICLE'
  | 'TRAVEL'
  | 'STRESS_RELIEF';

export interface LifeEventPrediction {
  id: string;
  event_type: string;
  category: LifeEventCategory;
  title: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number;
  detected_signals: string[];
  why_detected: string;
  recommendation: {
    title: string;
    product_type: string;
    description: string;
    benefit: string;
  };
  action: {
    label: string;
    route: string;
    query_prompt: string;
  };
}

export interface LifeEventPredictionResponse {
  customer_id: string;
  consent_restricted: boolean;
  predictions: LifeEventPrediction[];
  generated_at: string;
}

export interface SpendingOverview {
  total_spent_this_month: number;
  total_income_this_month: number;
  total_saved_this_month: number;
  savings_ratio: number;
  spending_score: number;
  insight_summary: string;
}

export interface SpendingCategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
  previous_month_amount: number;
  change_percentage: number;
  transaction_count: number;
  ai_explanation: string;
}

export interface OverspendingAlert {
  id: string;
  category: string;
  severity: 'HIGH' | 'MEDIUM';
  title: string;
  message: string;
  excess_amount: number;
  reason: string;
}

export interface SavingOpportunity {
  id: string;
  title: string;
  category: string;
  why_recommendation: string;
  estimated_monthly_savings: number;
  action_cta: string;
  action_route: string;
}

export interface WeeklySpendingTrend {
  current_week_total: number;
  previous_week_total: number;
  week_over_week_change_percentage: number;
  biggest_increase: { category: string; change_percentage: number };
  biggest_decrease: { category: string; change_percentage: number };
  weekly_breakdown: { period: string; amount: number }[];
  ai_weekly_insight: string;
}

export interface SpendingForecast {
  projected_spending: number;
  monthly_budget: number;
  budget_remaining: number;
  days_until_budget_exhaustion: number | null;
  burn_rate_daily: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'OVER_BUDGET';
  narrative: string;
}

export interface BudgetHealth {
  level: 'EXCELLENT' | 'HEALTHY' | 'WARNING' | 'CRITICAL';
  score: number;
  spending_ratio: number;
  savings_ratio: number;
  emi_burden_ratio: number;
  explanation: string;
}

export interface BudgetCoachTip {
  id: string;
  title: string;
  category: string;
  why_it_matters: string;
  financial_impact: string;
  easy_action_today: string;
}

export interface SpendingChallenge {
  id: string;
  title: string;
  description: string;
  duration_days: number;
  progress_percentage: number;
  money_saved: number;
  reward_badge: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'AVAILABLE';
}

export interface SpendingCoachPayload {
  overview: SpendingOverview;
  categories: SpendingCategoryBreakdown[];
  overspending_alerts: OverspendingAlert[];
  saving_opportunities: SavingOpportunity[];
  weekly_trends: WeeklySpendingTrend;
  forecast: SpendingForecast;
  budget_health: BudgetHealth;
  budget_coach_tips: BudgetCoachTip[];
  challenges: SpendingChallenge[];
}

export interface SpendingCoachResponse {
  customer_id: string;
  consent_restricted: boolean;
  data: SpendingCoachPayload | null;
  generated_at: string;
}

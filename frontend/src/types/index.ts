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

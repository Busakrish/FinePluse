export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: 'CUSTOMER' | 'ADMIN';
  created_at: string;
  updated_at: string;
}

export interface CustomerProfile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  location_tier: 'Tier 1' | 'Tier 2' | 'Tier 3' | 'Tier 4' | 'Rural';
  city: string;
  state: string;
  preferred_language: 'en' | 'hi' | 'gu';
  occupation: string;
  monthly_income: number;
  persona_tag: 'HEALTHY' | 'MODERATE' | 'STRESS' | 'FRAUD' | 'VERNACULAR' | 'WHATIF';
  created_at: string;
  updated_at: string;
}

export interface Account {
  id: string;
  customer_id: string;
  account_number: string;
  ifsc_code: string;
  account_type: 'SAVINGS' | 'CURRENT' | 'SALARY';
  balance: number;
  upi_id: string;
  status: 'ACTIVE' | 'FROZEN';
  created_at: string;
  updated_at: string;
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
  payment_method: 'UPI' | 'NEFT' | 'IMPS' | 'DEBIT_CARD' | 'AUTO_DEBIT';
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'FLAGGED';
  is_anomaly: boolean;
  created_at: string;
}

export interface Loan {
  id: string;
  customer_id: string;
  loan_type: 'PERSONAL' | 'HOME' | 'VEHICLE' | 'KISAN_CREDIT' | 'GOLD';
  principal_amount: number;
  outstanding_amount: number;
  interest_rate: number;
  tenure_months: number;
  monthly_emi: number;
  due_day_of_month: number;
  status: 'ACTIVE' | 'CLOSED' | 'OVERDUE' | 'RESTRUCTURED';
  missed_emis_count: number;
  created_at: string;
  updated_at: string;
}

export interface LoanPayment {
  id: string;
  loan_id: string;
  customer_id: string;
  amount: number;
  payment_date: string;
  due_date: string;
  status: 'PAID_ON_TIME' | 'PAID_LATE' | 'MISSED';
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
  status: 'IN_PROGRESS' | 'ACHIEVED' | 'PAUSED';
  created_at: string;
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

export interface FinancialTwin {
  id: string;
  customer_id: string;
  monthly_income: number;
  monthly_expenses: number;
  monthly_savings: number;
  monthly_emi_burden: number;
  savings_ratio: number; // percentage
  expense_ratio: number;
  emi_to_income_ratio: number;
  savings_growth_rate: number; // percentage change vs previous month
  financial_health_score: number; // 0-100
  financial_health_tier: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'STRESSED' | 'CRITICAL';
  stress_level: 'LOW' | 'MEDIUM' | 'HIGH';
  stress_score: number; // 0-100
  behavioral_segment: 'DISCIPLINED_SAVER' | 'ASPIRATIONAL_BORROWER' | 'VULNERABLE_BORROWER' | 'TRANSACTIONAL_USER';
  dont_sell_me_active: boolean;
  guardian_status: 'RECOMMEND' | 'HELP' | 'WARN' | 'PROTECT' | 'STAY_SILENT';
  last_evaluated_at: string;
}

export interface AIInsight {
  id: string;
  customer_id: string;
  title: string;
  summary: string;
  category: 'SPENDING' | 'SAVINGS' | 'STRESS' | 'FRAUD' | 'OPPORTUNITY';
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'WARNING' | 'URGENT';
  action_type: 'VIEW' | 'ADJUST_BUDGET' | 'PAY_EMI' | 'EXPLORE_PLAN';
  action_payload?: any;
  is_dismissed: boolean;
  created_at: string;
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

export interface Product {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  min_income_required: number;
  max_stress_allowed: 'LOW' | 'MEDIUM' | 'HIGH';
  annual_yield_or_interest: number;
  tenure_options: string[];
  created_at: string;
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
  status: 'PENDING_REVIEW' | 'CONFIRMED_FRAUD' | 'RESOLVED_LEGITIMATE';
  created_at: string;
}

export interface StressAlert {
  id: string;
  customer_id: string;
  stress_level: 'LOW' | 'MEDIUM' | 'HIGH';
  stress_score: number;
  contributing_factors: string[];
  recommended_support_action: string;
  dont_sell_me_engaged: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  customer_id: string;
  language: 'en' | 'hi' | 'gu';
  created_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  intent_detected?: string;
  verified_data_used?: any;
  language: string;
  created_at: string;
}

export interface WhatIfSimulation {
  id: string;
  customer_id: string;
  simulation_type: 'TAKE_LOAN' | 'INCOME_DECREASE' | 'EXPENSE_REDUCTION' | 'INCREASE_SAVINGS';
  input_params: {
    loan_amount?: number;
    interest_rate?: number;
    tenure_months?: number;
    income_delta_percent?: number;
    expense_reduction_amount?: number;
    monthly_savings_increase?: number;
  };
  current_metrics: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    monthly_emi: number;
    monthly_surplus: number;
    debt_burden_percent: number;
    financial_health_score: number;
    stress_level: string;
  };
  simulated_metrics: {
    monthly_income: number;
    monthly_expenses: number;
    monthly_savings: number;
    monthly_emi: number;
    monthly_surplus: number;
    debt_burden_percent: number;
    financial_health_score: number;
    stress_level: string;
    new_emi_amount?: number;
  };
  safety_assessment: 'SAFE' | 'CAUTION' | 'HIGH_RISK';
  ai_guidance: string;
  created_at: string;
}

export interface Notification {
  id: string;
  customer_id: string;
  title: string;
  message: string;
  type: 'GUARDIAN' | 'TRANSACTION' | 'RECOMMENDATION' | 'STRESS_ASSISTANCE' | 'SECURITY';
  is_read: boolean;
  created_at: string;
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

-- ============================================================
-- FINPULSE AI - Relational Database Schema (Section 31)
-- ============================================================

-- 1. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('CUSTOMER', 'ADMIN')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customer Profiles (Demographics, Tier, Persona, Vernacular)
CREATE TABLE IF NOT EXISTS customer_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    location_tier TEXT NOT NULL CHECK (location_tier IN ('Tier 1', 'Tier 2', 'Tier 3', 'Tier 4', 'Rural')),
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    preferred_language TEXT NOT NULL DEFAULT 'en', -- 'en', 'hi', 'gu'
    occupation TEXT NOT NULL,
    monthly_income NUMERIC(12, 2) NOT NULL,
    persona_tag TEXT NOT NULL, -- 'HEALTHY', 'MODERATE', 'STRESS', 'FRAUD', 'VERNACULAR', 'WHATIF'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Accounts Table (Savings, Current, UPI IDs)
CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    account_number TEXT UNIQUE NOT NULL,
    ifsc_code TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('SAVINGS', 'CURRENT', 'SALARY')),
    balance NUMERIC(14, 2) NOT NULL,
    upi_id TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 4. Transactions Table (Income, Expenses, UPI, EMIs)
CREATE TABLE IF NOT EXISTS transactions (
    id TEXT PRIMARY KEY,
    account_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('CREDIT', 'DEBIT')),
    category TEXT NOT NULL, -- 'Salary', 'Groceries', 'Utilities', 'EMI', 'Shopping', 'Transfer', 'Investment', 'Healthcare', 'Agriculture'
    description TEXT NOT NULL,
    merchant_name TEXT,
    reference_id TEXT UNIQUE NOT NULL,
    payment_method TEXT NOT NULL, -- 'UPI', 'NEFT', 'IMPS', 'DEBIT_CARD', 'AUTO_DEBIT'
    status TEXT NOT NULL DEFAULT 'COMPLETED',
    is_anomaly BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 5. Loans Table
CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    loan_type TEXT NOT NULL, -- 'PERSONAL', 'HOME', 'VEHICLE', 'KISAN_CREDIT', 'GOLD'
    principal_amount NUMERIC(12, 2) NOT NULL,
    outstanding_amount NUMERIC(12, 2) NOT NULL,
    interest_rate NUMERIC(5, 2) NOT NULL,
    tenure_months INTEGER NOT NULL,
    monthly_emi NUMERIC(10, 2) NOT NULL,
    due_day_of_month INTEGER NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ACTIVE', 'CLOSED', 'OVERDUE', 'RESTRUCTURED')),
    missed_emis_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 6. Loan Payments History
CREATE TABLE IF NOT EXISTS loan_payments (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL,
    customer_id TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('PAID_ON_TIME', 'PAID_LATE', 'MISSED')),
    FOREIGN KEY (loan_id) REFERENCES loans(id) ON DELETE CASCADE
);

-- 7. Financial Goals Table
CREATE TABLE IF NOT EXISTS financial_goals (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'EMERGENCY_FUND', 'CHILD_EDUCATION', 'HOUSE_DOWNPAYMENT', 'TRACTOR_PURCHASE', 'GOLD_SAVINGS', 'RETIREMENT'
    target_amount NUMERIC(12, 2) NOT NULL,
    current_amount NUMERIC(12, 2) NOT NULL,
    target_date DATE NOT NULL,
    monthly_contribution NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 8. Consents Table (DPDPA Privacy Compliance)
CREATE TABLE IF NOT EXISTS consents (
    id TEXT PRIMARY KEY,
    customer_id TEXT UNIQUE NOT NULL,
    transaction_analysis BOOLEAN DEFAULT TRUE,
    financial_health_analysis BOOLEAN DEFAULT TRUE,
    personalized_recommendations BOOLEAN DEFAULT TRUE,
    marketing_personalization BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 9. Financial Twins Table (Central Customer Financial Representation)
CREATE TABLE IF NOT EXISTS financial_twins (
    id TEXT PRIMARY KEY,
    customer_id TEXT UNIQUE NOT NULL,
    monthly_income NUMERIC(12, 2) NOT NULL,
    monthly_expenses NUMERIC(12, 2) NOT NULL,
    monthly_savings NUMERIC(12, 2) NOT NULL,
    monthly_emi_burden NUMERIC(12, 2) NOT NULL,
    savings_ratio NUMERIC(5, 2) NOT NULL,
    expense_ratio NUMERIC(5, 2) NOT NULL,
    emi_to_income_ratio NUMERIC(5, 2) NOT NULL,
    savings_growth_rate NUMERIC(5, 2) NOT NULL, -- e.g. -45% for stressed
    financial_health_score INTEGER NOT NULL, -- 0-100
    financial_health_tier TEXT NOT NULL, -- 'EXCELLENT', 'GOOD', 'FAIR', 'STRESSED', 'CRITICAL'
    stress_level TEXT NOT NULL, -- 'LOW', 'MEDIUM', 'HIGH'
    stress_score INTEGER NOT NULL, -- 0-100
    behavioral_segment TEXT NOT NULL, -- 'DISCIPLINED_SAVER', 'ASPIRATIONAL_BORROWER', 'VULNERABLE_BORROWER', 'TRANSACTIONAL_USER'
    dont_sell_me_active BOOLEAN DEFAULT FALSE,
    guardian_status TEXT NOT NULL, -- 'RECOMMEND', 'HELP', 'WARN', 'PROTECT', 'STAY_SILENT'
    last_evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 10. AI Insights Table
CREATE TABLE IF NOT EXISTS ai_insights (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    category TEXT NOT NULL, -- 'SPENDING', 'SAVINGS', 'STRESS', 'FRAUD', 'OPPORTUNITY'
    sentiment TEXT NOT NULL, -- 'POSITIVE', 'NEUTRAL', 'WARNING', 'URGENT'
    action_type TEXT NOT NULL, -- 'VIEW', 'ADJUST_BUDGET', 'PAY_EMI', 'EXPLORE_PLAN'
    action_payload JSON,
    is_dismissed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 11. Recommendations Table (With Explainable AI fields)
CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_type TEXT NOT NULL, -- 'SAVINGS', 'INVESTMENT', 'INSURANCE', 'CREDIT_CARD', 'LOAN', 'DEBT_RESTRUCTURING'
    what_is_recommended TEXT NOT NULL,
    why_is_relevant TEXT NOT NULL,
    benefit_description TEXT NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    confidence_score INTEGER NOT NULL, -- 0-100
    status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'BLOCKED_BY_POLICY', 'ACCEPTED', 'DISMISSED'
    block_reason TEXT,
    why_am_i_seeing_this JSON NOT NULL, -- Structured factors
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 12. Products Catalog Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    min_income_required NUMERIC(10, 2) DEFAULT 0,
    max_stress_allowed TEXT DEFAULT 'MEDIUM',
    annual_yield_or_interest NUMERIC(5, 2),
    tenure_options JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 13. Fraud Alerts Table
CREATE TABLE IF NOT EXISTS fraud_alerts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    transaction_id TEXT,
    amount NUMERIC(12, 2) NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    trigger_reason TEXT NOT NULL,
    z_score NUMERIC(5, 2),
    anomaly_factors JSON NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING_REVIEW', -- 'PENDING_REVIEW', 'CONFIRMED_FRAUD', 'RESOLVED_LEGITIMATE'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 14. Stress Alerts Table
CREATE TABLE IF NOT EXISTS stress_alerts (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    stress_level TEXT NOT NULL CHECK (stress_level IN ('LOW', 'MEDIUM', 'HIGH')),
    stress_score INTEGER NOT NULL,
    contributing_factors JSON NOT NULL,
    recommended_support_action TEXT NOT NULL,
    dont_sell_me_engaged BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 15. Chat Sessions & Messages
CREATE TABLE IF NOT EXISTS chat_sessions (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    sender TEXT NOT NULL CHECK (sender IN ('USER', 'ASSISTANT', 'SYSTEM')),
    content TEXT NOT NULL,
    intent_detected TEXT,
    verified_data_used JSON,
    language TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id) ON DELETE CASCADE
);

-- 16. What-If Simulations Table
CREATE TABLE IF NOT EXISTS what_if_simulations (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    simulation_type TEXT NOT NULL, -- 'TAKE_LOAN', 'INCOME_DECREASE', 'EXPENSE_REDUCTION', 'INCREASE_SAVINGS'
    input_params JSON NOT NULL,
    current_metrics JSON NOT NULL,
    simulated_metrics JSON NOT NULL,
    safety_assessment TEXT NOT NULL, -- 'SAFE', 'CAUTION', 'HIGH_RISK'
    ai_guidance TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 17. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL, -- 'GUARDIAN', 'TRANSACTION', 'RECOMMENDATION', 'STRESS_ASSISTANCE', 'SECURITY'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customer_profiles(id) ON DELETE CASCADE
);

-- 18. Audit Logs Table (Explainable AI & Regulatory Compliance)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    customer_id TEXT,
    event_type TEXT NOT NULL, -- 'BEHAVIOR_EVAL', 'STRESS_DETECTION', 'FRAUD_FLAG', 'RECOMMENDATION_DECISION', 'POLICY_GATEWAY_BLOCK', 'SIMULATED_PAYMENT', 'CONSENT_CHANGE'
    ai_engine TEXT NOT NULL, -- 'ENGINE_1_BEHAVIORAL', 'ENGINE_2_RECOMMENDATION', 'ENGINE_3_STRESS', 'ENGINE_4_FRAUD', 'ENGINE_5_VERNACULAR', 'ENGINE_6_WHATIF', 'SAFETY_GATEWAY'
    input_summary JSON NOT NULL,
    engine_output JSON NOT NULL,
    policy_decision TEXT NOT NULL, -- 'ALLOWED', 'MODIFIED', 'SUPPRESSED_DONT_SELL_ME', 'FLAGGED'
    final_action_taken TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_tx_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_tx_account ON transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_loans_customer ON loans(customer_id);
CREATE INDEX IF NOT EXISTS idx_recom_customer ON recommendations(customer_id);
CREATE INDEX IF NOT EXISTS idx_audit_customer ON audit_logs(customer_id);

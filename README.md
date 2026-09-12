# FINPULSE AI
### *"AI-Powered Hyper-Personalized Banking for Bharat"*

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-24+-green.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 1. Executive Summary & Problem Statement

### Theme: Digital Transformation in Lending
**Problem Statement:** Indian banks have built robust digital payment infrastructure (UPI, NetBanking, Video KYC), yet millions of customers across Tier 2/3/4 towns and rural Bharat find digital banking generic, intimidating, and disconnected from their real cashflow needs. Banks struggle with rising customer acquisition costs, high loan application drop-offs, and lack of timing in cross-selling.

### FINPULSE AI Solution:
FINPULSE AI is an **enterprise-grade, explainable, and responsible FinTech platform** tailored specifically for Bharat. It continuously learns from transactional signals, generates a dynamic **AI Financial Twin**, evaluates customer needs through **Six Specialized AI Engines**, passes all proposals through a deterministic **Safety & Policy Gateway**, and delivers explainable, vernacular-first banking experiences.

---

## 2. Core Architecture & Workflow

```
                        CUSTOMER
                           │
                           ▼
                  DIGITAL BANKING UI
                  (React + Tailwind)
                           │
                           ▼
                      BACKEND API
                  (Node.js + Express)
                           │
                           ▼
                  CUSTOMER DATA LAYER
              (Relational Schema / 18 Tables)
              ┌────────────┼────────────┐
              │            │            │
         Transactions    Accounts    Customer
         & Payments      & Loans     Profiles
              │            │            │
              └────────────┼────────────┘
                           ▼
                   AI FINANCIAL TWIN
                           │
                           ▼
                  SIX AI ENGINES
           ┌───────────────┼────────────────┐
           ▼               ▼                ▼
     Engine 1:       Engine 2:        Engine 3:
     Behavioral    Personalization   Financial
    Intelligence   & Recommendation    Stress
           │               │                │
           ├───────────────┼────────────────┤
           │               │                │
           ▼               ▼                ▼
     Engine 4:       Engine 5:        Engine 6:
       Fraud          Vernacular      What-If
     Detection           AI          Simulator
           │               │                │
           └───────────────┼────────────────┘
                           ▼
                   SAFETY / POLICY
                       GATEWAY
          (Consent -> Stress -> Affordability)
                           │
                           ▼
                   NEXT BEST ACTION
           ┌───────────────┼────────────────┐
           ▼               ▼                ▼
       Recommend        Assist            Warn
           │               │                │
           ▼               ▼                ▼
        Protect          Guide          No Action
                           │
                           ▼
                  CUSTOMER EXPERIENCE
```

---

## 3. The Six AI Engines

| Engine | Name | Function & Logic | Output |
| :--- | :--- | :--- | :--- |
| **Engine 1** | **Behavioral Intelligence** | Analyzes transaction velocity, income stability, category breakdown, discretionary vs essential ratios, and savings growth trends. | Spending profile, savings rate, behavioral tier (`DISCIPLINED_SAVER`, `VULNERABLE_BORROWER`, etc.). |
| **Engine 2** | **Personalization & Recommendation** | Multi-criteria weighted scoring matching products (Savings, Gold SIP, Emergency FD, Debt Restructuring) with transparent XAI factor attribution. | Structured recommendations with *"Why am I seeing this?"* factor transparency. |
| **Engine 3** | **Financial Stress Detection** | Monitors early warning signals: declining savings (-45%), rising expenses, high EMI burden (>40%), and missed EMIs. | Stress index (0-100), categorization (`LOW`, `MEDIUM`, `HIGH`), and empathetic relief trigger. |
| **Engine 4** | **Fraud & Anomaly Detection** | Hybrid statistical outlier detection (z-score >= 3.5, time-of-day violations, unverified merchant indicators). | Flags anomalies (e.g. ₹85,000 electronics spike at 02:45 AM) with plain-language reasons. |
| **Engine 5** | **Vernacular Conversational AI** | Multilingual NLP supporting English, Hindi (हिन्दी), and Gujarati (ગુજરાતી) with script & transliteration (e.g., *"Mera EMI kitna hai?"*, *"Mare loan ni details joi che"*). Verified backend data pipeline. | Zero-hallucination factual banking responses and localized suggested prompt pills. |
| **Engine 6** | **Financial What-If Simulator** | Deterministic mathematical simulation for loans ($EMI = P \cdot r \cdot \frac{(1+r)^n}{(1+r)^n - 1}$), income reductions, and savings targets. | Side-by-side Current vs Simulated comparison table with surplus and debt burden impact. |

---

## 4. Key Responsible AI Features

### 🛡️ Safety & Policy Gateway
Every recommendation must pass through:
`DPDPA Consent Check` ➔ `Data Purpose Verification` ➔ `Cashflow Affordability` ➔ `Financial Stress Filter` ➔ `RBI Fair Lending Policy` ➔ `Final Action`.

### 🚫 Don't Sell Me Mode
**Safety Always Overrides Sales.** When high financial stress is detected (e.g., Customer C - Amit Sharma):
- Commercial loan marketing is **immediately suppressed** and logged to audit trails.
- Empathetic assistance is presented: **Samadhan EMI Restructuring** (reducing EMI from ₹24,000 to ₹13,200), tenure extension calculator, and toll-free counselor callback.

### 🔍 Explainable AI (XAI) — *"Why am I seeing this?"*
Judges and customers can click the *"Why am I seeing this?"* button on any offer to inspect:
- Key contributing behavioral and transactional factors.
- Spending pattern and cashflow match.
- Disposable liquidity assessment.
- Specific regulatory/safety rule applied.

### 🔒 DPDPA 2023 Consent Center
Granular consent toggles for Transaction Analysis, Health Scoring, Recommendation Personalization, and Marketing. If consent is disabled, the AI engine immediately suppresses data usage.

---

## 5. Demo Scenarios & Persona Switcher

A floating **Demo Scenario Switcher** is pinned to the header for 1-click live testing by judges:

1. **Customer A (Healthy — Rahul Verma):**
   - Income: ₹85,000 | Savings: 41% | Low EMI: 14%
   - *Outcome:* Recommended sovereign-backed Gold SIP & Index SIP with 94% confidence.
2. **Customer B (Moderate — Priya Patel):**
   - Income: ₹45,000 | Savings: 18% | Steady retail cashflow
   - *Outcome:* Liquid emergency fund builder recommendation.
3. **Customer C (Financial Stress — Amit Sharma):**
   - Income: ₹40,000 | Savings drop: -45% | High EMI: 60% | Missed EMI: 1
   - *Outcome:* **DON'T SELL ME MODE ACTIVE**, Personal Loan cross-sell **BLOCKED BY POLICY**, Samadhan EMI Restructuring offered.
4. **Customer D (Fraud Anomaly — Vikram Rao):**
   - Typical txns: ₹400 - ₹2,500 | Sudden spike: ₹85,000 at 02:45 AM
   - *Outcome:* High-risk anomaly alert triggered (z-score: 4.82).
5. **Customer E (Vernacular Rural — Ramesh Patel):**
   - Gujarati native dairy farmer from Anand.
   - *Outcome:* Complete UI and conversational assistant in Gujarati (ગુજરાતી) handling crop cycle queries.
6. **Customer F (What-If Loan — Sunita Devi):**
   - Government teacher evaluating ₹5 Lakh home renovation loan.
   - *Outcome:* Deterministic before/after surplus and debt burden simulation.
7. **Admin (Rajesh Gupta — Chief Risk & Compliance Officer):**
   - Live AI decision stream displaying algorithm recommendations vs Safety Gateway policy intercepts.

---

## 6. Problem Statement (PS) Alignment Matrix

| Problem Statement Requirement | FINPULSE Feature | Implementation | Demo Screen |
| :--- | :--- | :--- | :--- |
| **Analyze transaction history & spending** | Behavioral Intelligence Engine | Category classification, savings delta, income stability | `/twin`, `/health` |
| **Proactively recommend relevant products** | Personalization Engine | Weighted multi-criteria scoring with confidence metric | `/recommendations` |
| **Explainable recommendations** | Explainable AI (XAI) Modal | *"Why am I seeing this?"* factor breakdown modal | `/recommendations` |
| **Simplified onboarding & KYC** | Conversational Guided KYC | Synthetic Aadhaar/OTP verification without real PII | `/onboarding` |
| **Simplified loan journey** | 10-Step Simulated Journey | Real-time debt capacity and stress gate check | `/loan-journey` |
| **Conversational AI & Vernacular UX** | Vernacular AI Assistant | Hindi, Gujarati, English with verified backend facts | `/assistant` |
| **Detect financial stress early** | Financial Stress Engine | EMI burden, liquid cushion & savings decline tracker | `/stress-assistance` |
| **Detect unusual transactions / fraud** | Fraud & Anomaly Engine | Statistical z-score outlier detection & time analysis | `/fraud-security` |
| **Avoid predatory nudging** | Don't Sell Me Mode | Automatic loan suppression under high stress | `/stress-assistance` |
| **Data privacy & DPDPA compliance** | Consent Center | Granular consent toggles with real-time AI effect | `/consent` |
| **Regulatory oversight & auditability** | Admin AI Decision Monitor | Real-time policy intercept matrix & audit trail | `/admin`, `/audit-logs` |

---

## 7. Quickstart & Installation

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Clone & Setup Backend
```bash
cd backend
npm install
npm run seed      # Seeds the 6 deterministic personas + Admin
npm test          # Runs automated acceptance test suite (8/8 PASS)
npm run dev       # Starts backend server on port 5000
```

### 2. Setup & Run Frontend
```bash
cd ../frontend
npm install
npm run build     # Verifies production asset compilation
npm run dev       # Starts Vite dev server on http://localhost:3000
```

### 3. Open in Browser
Open `http://localhost:3000` to interact with all pages and demo scenarios.

---

## 8. Verification & Acceptance Test Suite

The backend includes an automated test runner (`backend/tests/run-all-tests.ts`) validating all 8 mandatory acceptance criteria:
- **TEST 1 [PASS]:** Healthy customer receives personalized investment/savings recommendation.
- **TEST 2 [PASS]:** Financially stressed customer triggers HIGH stress, blocks loan cross-sell, and activates Don't Sell Me Mode.
- **TEST 3 [PASS]:** ₹85,000 unusual transaction triggers HIGH-RISK anomaly flag with statistical explanation.
- **TEST 4 [PASS]:** What-If simulation calculations are mathematically deterministic.
- **TEST 5 [PASS]:** Strict customer data isolation and independent identity partitioning.
- **TEST 6 [PASS]:** Turning OFF personalization consent strictly suppresses recommendation generation.
- **TEST 7 [PASS]:** Offline Demo AI Mode provides accurate verified factual response without external LLM dependency.
- **TEST 8 [PASS]:** Native Gujarati query accurately maps intent and returns localized response with verified data.

---

## 9. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, Canvas Confetti
- **Backend:** Node.js, TypeScript, Express, Zod, JWT, bcryptjs
- **Database & Storage:** Relational schema with 18 tables, constraints, indexes, and audit logging
- **AI / ML Layer:** Behavioral analytics, multi-criteria recommendation scoring, z-score statistical anomaly detection, multilingual intent parser, deterministic financial amortization simulator, and Demo AI Mode fallback.

---

## 10. Responsible AI & Regulatory Readiness Statement

1. **Human-in-the-Loop & Oversight:** All lending actions in this prototype are informational and advisory. The system does not sanction real-world credit without full underwriting.
2. **Synthetic Data Notice:** All customer accounts, transactions, and identifiers are synthetic and designed exclusively for hackathon demonstration.
3. **No Predatory Nudging:** The architecture enforces a hard boundary prohibiting cross-selling credit to financially stressed customers.
4. **DPDPA 2023 Principles:** Incorporates data minimization, purpose limitation, and consent revocation mechanisms.

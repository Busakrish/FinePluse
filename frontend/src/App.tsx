import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';

import { DashboardPage } from './pages/DashboardPage';
import { FinancialTwinPage } from './pages/FinancialTwinPage';
import { FinancialHealthPage } from './pages/FinancialHealthPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { StressAssistancePage } from './pages/StressAssistancePage';
import { TransactionsPage } from './pages/TransactionsPage';
import { SimulatedUpiPage } from './pages/SimulatedUpiPage';
import { ConversationalAssistantPage } from './pages/ConversationalAssistantPage';
import { WhatIfPage } from './pages/WhatIfPage';
import { LoanJourneyPage } from './pages/LoanJourneyPage';
import { OnboardingKycPage } from './pages/OnboardingKycPage';
import { FraudSecurityPage } from './pages/FraudSecurityPage';
import { ConsentCenterPage } from './pages/ConsentCenterPage';
import { AdminDecisionMonitorPage } from './pages/AdminDecisionMonitorPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { LoginPage } from './pages/LoginPage';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Header />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Layout><DashboardPage /></Layout>} />
            <Route path="/twin" element={<Layout><FinancialTwinPage /></Layout>} />
            <Route path="/health" element={<Layout><FinancialHealthPage /></Layout>} />
            <Route path="/recommendations" element={<Layout><RecommendationsPage /></Layout>} />
            <Route path="/stress-assistance" element={<Layout><StressAssistancePage /></Layout>} />
            <Route path="/transactions" element={<Layout><TransactionsPage /></Layout>} />
            <Route path="/upi" element={<Layout><SimulatedUpiPage /></Layout>} />
            <Route path="/assistant" element={<Layout><ConversationalAssistantPage /></Layout>} />
            <Route path="/what-if" element={<Layout><WhatIfPage /></Layout>} />
            <Route path="/loan-journey" element={<Layout><LoanJourneyPage /></Layout>} />
            <Route path="/onboarding" element={<Layout><OnboardingKycPage /></Layout>} />
            <Route path="/fraud-security" element={<Layout><FraudSecurityPage /></Layout>} />
            <Route path="/consent" element={<Layout><ConsentCenterPage /></Layout>} />
            <Route path="/admin" element={<Layout><AdminDecisionMonitorPage /></Layout>} />
            <Route path="/audit-logs" element={<Layout><AuditLogPage /></Layout>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;

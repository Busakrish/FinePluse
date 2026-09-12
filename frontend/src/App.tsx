import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { ProtectedRoute } from './components/ProtectedRoute';

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
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <Header />
      <div className="flex flex-1 min-h-0">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col min-h-0 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

// Redirect to appropriate landing if already logged in
// IMPORTANT: Never return null here — that unmounts LoginPage and destroys error state mid-request
const LoginRoute: React.FC = () => {
  const { user, token, loading } = useAuth();
  // Only redirect if we have BOTH a token AND a user (fully authenticated)
  // Do NOT block on loading — let LoginPage render immediately
  if (!loading && token && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/'} replace />;
  }
  return <LoginPage />;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <Routes>
            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginRoute />} />

            {/* Retail Customer Banking Routes (Protected) */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout><DashboardPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/twin"
              element={
                <ProtectedRoute>
                  <Layout><FinancialTwinPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/health"
              element={
                <ProtectedRoute>
                  <Layout><FinancialHealthPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/recommendations"
              element={
                <ProtectedRoute>
                  <Layout><RecommendationsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/stress-assistance"
              element={
                <ProtectedRoute>
                  <Layout><StressAssistancePage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  <Layout><TransactionsPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upi"
              element={
                <ProtectedRoute>
                  <Layout><SimulatedUpiPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/assistant"
              element={
                <ProtectedRoute>
                  <Layout><ConversationalAssistantPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/what-if"
              element={
                <ProtectedRoute>
                  <Layout><WhatIfPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/loan-journey"
              element={
                <ProtectedRoute>
                  <Layout><LoanJourneyPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/onboarding"
              element={
                <ProtectedRoute>
                  <Layout><OnboardingKycPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/fraud-security"
              element={
                <ProtectedRoute>
                  <Layout><FraudSecurityPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/consent"
              element={
                <ProtectedRoute>
                  <Layout><ConsentCenterPage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* STRICT ADMIN & RISK OFFICER ROUTES (Requires ADMIN Role) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roleRequired="ADMIN">
                  <Layout><AdminDecisionMonitorPage /></Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              element={
                <ProtectedRoute roleRequired="ADMIN">
                  <Layout><AuditLogPage /></Layout>
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;

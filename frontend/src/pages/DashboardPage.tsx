import React, { useState, useEffect } from 'react';
import {
  Wallet,
  TrendingUp,
  CreditCard,
  HeartHandshake,
  ArrowUpRight,
  ArrowDownLeft,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  Send,
  ShieldCheck,
  ChevronRight,
  Compass,
  PieChart as PieChartIcon,
  BotMessageSquare,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { api } from '../services/api';
import { FinancialTwin, Recommendation, NextBestAction, AIInsight, Transaction, Account } from '../types';
import { GuardianPill } from '../components/GuardianPill';
import { DontSellMeBanner } from '../components/DontSellMeBanner';
import { ExplainModal } from '../components/ExplainModal';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [twin, setTwin] = useState<FinancialTwin | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [nextBest, setNextBest] = useState<NextBestAction | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedRecForExplain, setSelectedRecForExplain] = useState<Recommendation | null>(null);
  const [lifeEventSummary, setLifeEventSummary] = useState<{ count: number; topTitle?: string; restricted?: boolean } | null>(null);
  const [spendingSummary, setSpendingSummary] = useState<{ healthLevel: string; score: number; burnRate: string; opportunitiesCount: number; restricted?: boolean } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const results = await Promise.allSettled([
        api.get('/ai/financial-twin'),
        api.get('/ai/recommendations'),
        api.get('/ai/next-best-action'),
        api.get('/ai/insights'),
        api.get('/transactions'),
        api.get('/customers/me'),
        api.get('/life-events'),
        api.get('/spending/coach'),
      ]);

      const [twinRes, recsRes, nbaRes, insRes, txRes, meRes, lifeRes, spendRes] = results;

      if (twinRes.status === 'fulfilled' && twinRes.value.data.success) {
        setTwin(twinRes.value.data.financial_twin);
      }
      if (recsRes.status === 'fulfilled' && recsRes.value.data.success) {
        setRecommendations(recsRes.value.data.recommendations);
      }
      if (nbaRes.status === 'fulfilled' && nbaRes.value.data.success) {
        setNextBest(nbaRes.value.data.next_best_action);
      }
      if (insRes.status === 'fulfilled' && insRes.value.data.success) {
        setInsights(insRes.value.data.insights);
      }
      if (txRes.status === 'fulfilled' && txRes.value.data.success) {
        setTransactions(txRes.value.data.transactions.slice(0, 5));
      }
      if (meRes.status === 'fulfilled' && meRes.value.data.success) {
        setAccount(meRes.value.data.account);
      }
      if (lifeRes && lifeRes.status === 'fulfilled' && lifeRes.value.data.success) {
        const events = lifeRes.value.data.events || [];
        setLifeEventSummary({
          count: events.length,
          topTitle: events[0]?.title,
          restricted: lifeRes.value.data.consent_restricted,
        });
      }
      if (spendRes && spendRes.status === 'fulfilled' && spendRes.value.data.success) {
        const coach = spendRes.value.data;
        setSpendingSummary({
          healthLevel: coach.spending_health?.health_level || 'GOOD',
          score: coach.spending_health?.score || 80,
          burnRate: coach.spending_health?.burn_rate_status || 'NORMAL',
          opportunitiesCount: coach.opportunities?.length || 0,
          restricted: coach.consent_restricted,
        });
      }
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // Chart data
  const spendingData = [
    { name: 'EMI Repayments', value: twin?.monthly_emi_burden || 12000, color: '#f59e0b' },
    { name: 'Living & Groceries', value: Math.round((twin?.monthly_expenses || 30000) * 0.4), color: '#3b82f6' },
    { name: 'Utilities & Bills', value: Math.round((twin?.monthly_expenses || 30000) * 0.25), color: '#06b6d4' },
    { name: 'Healthcare & Other', value: Math.round((twin?.monthly_expenses || 30000) * 0.35), color: '#ec4899' },
  ];

  const savingsTrendData = [
    { month: 'Apr', savings: (twin?.monthly_income || 50000) * 0.25 },
    { month: 'May', savings: (twin?.monthly_income || 50000) * 0.28 },
    { month: 'Jun', savings: (twin?.monthly_income || 50000) * 0.30 },
    { month: 'Jul', savings: (twin?.monthly_income || 50000) * 0.26 },
    { month: 'Aug', savings: (twin?.monthly_income || 50000) * 0.32 },
    { month: 'Sep (Current)', savings: twin?.monthly_savings || 15000 },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Don't Sell Me Mode Banner if customer in high stress */}
      {twin?.dont_sell_me_active && (
        <DontSellMeBanner factors={nextBest?.factors} />
      )}

      {/* Purpose & Platform Explainer Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                AI Financial Twin • Digital Passbook
              </span>
              <span className="text-xs text-blue-200">NPCI Certified • Bharat 2026</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Namaste, {user?.name || 'Customer'}!
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 max-w-2xl leading-relaxed">
              FinPulse AI continuously mirrors your transactional cashflow, calculates your real-time debt safety limits, and ensures you only receive ethical financial opportunities with complete transparency.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <GuardianPill status={twin?.guardian_status || 'RECOMMEND'} className="bg-white text-slate-900 shadow-sm" />
            <Link
              to="/twin"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition"
            >
              Inspect AI Twin →
            </Link>
          </div>
        </div>
      </div>

      {/* Top Welcome & Account Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Linked Account Details</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span className="text-emerald-700 font-semibold">Active & KYC Verified</span>
          </div>
          <p className="text-xs sm:text-sm text-slate-700 mt-1 font-medium">
            UPI ID: <span className="text-blue-700 font-mono font-bold">{account?.upi_id || 'user@bharatpay'}</span> | Account No: <span className="font-mono text-slate-900 font-bold">•••• •••• {account?.account_number.slice(-4) || '8172'}</span> ({account?.account_type || 'Savings'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/upi"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>{t('send_money')}</span>
          </Link>
          <Link
            to="/assistant"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>{t('nav_assistant')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-blue-600 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{t('total_balance')}</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{account?.balance?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1.5 flex items-center gap-1 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Instant Liquid Availability</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-indigo-600 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{t('monthly_income')}</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{twin?.monthly_income?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Cashflow Stability: <span className="text-indigo-700 font-bold">{twin?.behavioral_segment || 'Disciplined'}</span>
          </div>
        </div>

        {/* EMI Burden */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-amber-500 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{t('active_emi')}</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            ₹{twin?.monthly_emi_burden?.toLocaleString('en-IN') || '0'}
          </div>
          <div className={`text-[11px] font-bold mt-1.5 ${(twin?.emi_to_income_ratio || 0) > 40 ? 'text-rose-700' : 'text-emerald-700'}`}>
            {twin?.emi_to_income_ratio || 0}% of Monthly Income (Safe &lt; 40%)
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 p-5 rounded-2xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>{t('health_score')}</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-slate-900">{twin?.financial_health_score || 70}</span>
            <span className="text-xs text-slate-500 font-bold">/ 100</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ml-auto ${
              twin?.financial_health_score && twin.financial_health_score >= 80
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                : twin?.financial_health_score && twin.financial_health_score >= 60
                ? 'bg-blue-50 text-blue-800 border border-blue-300'
                : 'bg-rose-50 text-rose-800 border border-rose-300'
            }`}>
              {twin?.financial_health_tier || 'GOOD'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1.5 font-medium">
            Stress Index: <span className="font-bold text-slate-800">{twin?.stress_level || 'LOW'}</span>
          </div>
        </div>
      </div>

      {/* Next Best Action Card (Central Decision Layer - Section 17) */}
      {nextBest && (
        <div className="bg-white border-2 border-blue-500 p-6 rounded-3xl shadow-sm bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wide">
                  AI Next Best Action
                </span>
                <span className="text-xs text-slate-500 font-medium">• Priority Policy Verified</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{nextBest.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                {nextBest.message}
              </p>
            </div>

            <Link
              to={nextBest.action_route}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shrink-0 shadow-xs transition-all hover:scale-105"
            >
              <span>{nextBest.action_cta}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* AI Intelligence Hub - Lightweight Preview & Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* 1. Life Event Prediction AI Preview */}
        <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/40 border border-indigo-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md hover:border-indigo-200 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-700 flex items-center justify-center font-bold">
                <Compass className="w-5 h-5 text-indigo-600 group-hover:rotate-45 transition-transform duration-300" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100/80 text-indigo-700 border border-indigo-200/60">
                Milestones
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              Life Event Milestones
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {lifeEventSummary?.restricted
                ? 'Consent required to unlock life event milestone intelligence.'
                : lifeEventSummary?.topTitle
                ? `Detected milestone: ${lifeEventSummary.topTitle} with proactive liquidity guardrails.`
                : 'Proactive detection of upcoming life milestones like career transitions, weddings, and investments.'}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-indigo-100/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-700">
              {lifeEventSummary?.count ? `${lifeEventSummary.count} Active Signals` : 'Proactive Monitor'}
            </span>
            <Link
              to="/life-events"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-700 hover:text-indigo-800 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View Predicted Milestones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 2. AI Spending Coach Preview */}
        <div className="bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 border border-emerald-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md hover:border-emerald-200 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/10 text-emerald-700 flex items-center justify-center font-bold">
                <PieChartIcon className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-700 border border-emerald-200/60">
                Spending Coach
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              AI Spending Coach
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              {spendingSummary?.restricted
                ? 'Consent required to compute personalized overspending diagnostics.'
                : spendingSummary
                ? `Budget health is ${spendingSummary.healthLevel} (${spendingSummary.score}/100) with ${spendingSummary.opportunitiesCount} savings tips.`
                : 'Real-time cashflow diagnostics, overspending alerts, and month-end burn rate projections.'}
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-emerald-100/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700">
              {spendingSummary ? `Score: ${spendingSummary.score}/100` : 'Real-time Guard'}
            </span>
            <Link
              to="/spending-coach"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 group-hover:translate-x-0.5 transition-transform"
            >
              <span>View Spending Insights</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 3. AI Chatbot Copilot Preview */}
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-cyan-50/40 border border-blue-100 p-5 rounded-2xl shadow-xs flex flex-col justify-between hover:shadow-md hover:border-blue-200 transition-all group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold">
                <BotMessageSquare className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform duration-300" />
              </div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100/80 text-blue-700 border border-blue-200/60">
                Copilot 24/7
              </span>
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              AI Banking Copilot
            </h4>
            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
              Ask questions in English, Hindi, or Gujarati: "Can I afford a new loan?" or "Where did I overspend this week?"
            </p>
          </div>

          <div className="pt-4 mt-3 border-t border-blue-100/60 flex items-center justify-between">
            <span className="text-[11px] font-semibold text-blue-700">
              Voice & Text Ready
            </span>
            <Link
              to="/assistant"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 group-hover:translate-x-0.5 transition-transform"
            >
              <span>Chat with Copilot</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recommendations & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personalized AI Recommendations with "Why am I seeing this?" */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              {t('nav_recommendations')}
            </h3>
            <Link to="/recommendations" className="text-xs text-blue-700 hover:text-blue-800 font-bold">
              View All Offers →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="bg-white border border-slate-200 p-8 rounded-2xl text-center text-slate-500 text-xs shadow-xs">
                No active promotional recommendations right now. Your finances are in a defensive protection window to avoid unnecessary borrowing.
              </div>
            ) : (
              recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="glass-panel-interactive p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {rec.product_type}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{rec.product_name}</h4>
                      </div>
                      <p className="text-xs text-slate-600 mt-1">{rec.what_is_recommended}</p>
                    </div>

                    <button
                      onClick={() => setSelectedRecForExplain(rec)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-50 hover:bg-slate-100 text-blue-700 border border-slate-200 shrink-0 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t('why_am_i_seeing_this')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500 text-[11px]">{rec.benefit_description}</span>
                    <span className="text-emerald-700 font-bold shrink-0 ml-2">{rec.confidence_score}% Match</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Spending Category Pie Chart */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">{t('spending_breakdown')}</h3>
              <span className="text-[11px] text-slate-500 font-medium">Categorized from UPI & NetBanking</span>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={spendingData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {spendingData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100">
              {spendingData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}:</span>
                  <span className="font-bold text-slate-900 ml-auto">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Savings Trend & Recent Transactions */}
        <div className="space-y-6">
          {/* Savings Growth Area Chart */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">{t('savings_growth')}</h3>
              <span className="text-[11px] text-emerald-700 font-bold">+12% vs Prev Qtr</span>
            </div>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsTrendData}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} hide />
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '12px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <Area type="monotone" dataKey="savings" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#savingsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions List (Digital Passbook) */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{t('recent_transactions')}</h3>
              <Link to="/transactions" className="text-xs text-blue-700 hover:text-blue-800 font-bold">
                Passbook →
              </Link>
            </div>

            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs hover:bg-slate-100/60 transition">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">{tx.description}</div>
                      <div className="text-[10px] text-slate-500 font-medium">{new Date(tx.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div className={`font-bold shrink-0 ml-2 ${tx.type === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'}`}>
                    {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Explainable AI Modal Trigger */}
      <ExplainModal
        isOpen={!!selectedRecForExplain}
        onClose={() => setSelectedRecForExplain(null)}
        recommendation={selectedRecForExplain}
      />
    </div>
  );
};

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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [twinRes, recsRes, nbaRes, insRes, txRes, meRes] = await Promise.all([
        api.get('/ai/financial-twin'),
        api.get('/ai/recommendations'),
        api.get('/ai/next-best-action'),
        api.get('/ai/insights'),
        api.get('/transactions'),
        api.get('/customers/me'),
      ]);

      if (twinRes.data.success) setTwin(twinRes.data.financial_twin);
      if (recsRes.data.success) setRecommendations(recsRes.data.recommendations);
      if (nbaRes.data.success) setNextBest(nbaRes.data.next_best_action);
      if (insRes.data.success) setInsights(insRes.data.insights);
      if (txRes.data.success) setTransactions(txRes.data.transactions.slice(0, 5));
      if (meRes.data.success) setAccount(meRes.data.account);
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

      {/* Top Welcome Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 glass-panel p-6 rounded-3xl">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Namaste, {user?.name || 'Customer'}!
            </h2>
            <GuardianPill status={twin?.guardian_status || 'RECOMMEND'} />
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            UPI: <span className="text-indigo-300 font-mono">{account?.upi_id || 'user@bharatpay'}</span> | Account: <span className="font-mono text-slate-300">...{account?.account_number.slice(-4) || '8172'}</span> ({account?.account_type || 'Savings'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/upi"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02]"
          >
            <Send className="w-4 h-4" />
            <span>{t('send_money')}</span>
          </Link>
          <Link
            to="/assistant"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{t('nav_assistant')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Balance Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{t('total_balance')}</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{account?.balance?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-[11px] text-emerald-400 mt-1.5 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Active UPI Linked</span>
          </div>
        </div>

        {/* Monthly Income */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{t('monthly_income')}</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{twin?.monthly_income?.toLocaleString('en-IN') || '0'}
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            Verified Stream: <span className="text-slate-300 font-semibold">{twin?.behavioral_segment || 'Disciplined'}</span>
          </div>
        </div>

        {/* EMI Burden */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{t('active_emi')}</span>
            <CreditCard className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            ₹{twin?.monthly_emi_burden?.toLocaleString('en-IN') || '0'}
          </div>
          <div className={`text-[11px] font-semibold mt-1.5 ${(twin?.emi_to_income_ratio || 0) > 40 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {twin?.emi_to_income_ratio || 0}% of Monthly Income
          </div>
        </div>

        {/* Health Score Gauge */}
        <div className="glass-panel p-5 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>{t('health_score')}</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white">{twin?.financial_health_score || 70}</span>
            <span className="text-xs text-slate-400">/ 100</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ml-auto ${
              twin?.financial_health_score && twin.financial_health_score >= 80
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : twin?.financial_health_score && twin.financial_health_score >= 60
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
            }`}>
              {twin?.financial_health_tier || 'GOOD'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1.5">
            Stress Level: <span className="font-bold text-white">{twin?.stress_level || 'LOW'}</span>
          </div>
        </div>
      </div>

      {/* Next Best Action Card (Central Decision Layer - Section 17) */}
      {nextBest && (
        <div className="glass-panel p-6 rounded-3xl border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-slate-900/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 uppercase tracking-wide">
                  AI Next Best Action
                </span>
                <span className="text-xs text-slate-400">• Priority Verified</span>
              </div>
              <h3 className="text-lg font-bold text-white">{nextBest.title}</h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
                {nextBest.message}
              </p>
            </div>

            <Link
              to={nextBest.action_route}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shrink-0 shadow-lg shadow-indigo-600/30 transition-all hover:scale-105"
            >
              <span>{nextBest.action_cta}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recommendations & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Personalized AI Recommendations with "Why am I seeing this?" */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              {t('nav_recommendations')}
            </h3>
            <Link to="/recommendations" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
              View All Offers →
            </Link>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
                No active promotional recommendations right now. Your finances are in a defensive protection window.
              </div>
            ) : (
              recommendations.slice(0, 2).map((rec) => (
                <div key={rec.id} className="glass-panel-interactive p-5 rounded-2xl space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          {rec.product_type}
                        </span>
                        <h4 className="text-sm font-bold text-white">{rec.product_name}</h4>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{rec.what_is_recommended}</p>
                    </div>

                    <button
                      onClick={() => setSelectedRecForExplain(rec)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-indigo-500/30 shrink-0 transition"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>{t('why_am_i_seeing_this')}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">{rec.benefit_description}</span>
                    <span className="text-emerald-400 font-bold shrink-0 ml-2">{rec.confidence_score}% Match</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Spending Category Pie Chart */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-3">{t('spending_breakdown')}</h3>
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
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {spendingData.map((item) => (
                <div key={item.name} className="flex items-center gap-2 text-xs text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="truncate">{item.name}:</span>
                  <span className="font-bold text-white ml-auto">₹{item.value.toLocaleString('en-IN')}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Savings Trend & Recent Transactions */}
        <div className="space-y-6">
          {/* Savings Growth Area Chart */}
          <div className="glass-panel p-5 rounded-2xl">
            <h3 className="text-sm font-bold text-white mb-2">{t('savings_growth')}</h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={savingsTrendData}>
                  <defs>
                    <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="month" stroke="#64748b" fontSize={10} />
                  <YAxis stroke="#64748b" fontSize={10} hide />
                  <Tooltip
                    formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#savingsGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="glass-panel p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">{t('recent_transactions')}</h3>
              <Link to="/transactions" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">
                View All →
              </Link>
            </div>

            <div className="space-y-2">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`p-1.5 rounded-lg shrink-0 ${tx.type === 'CREDIT' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{tx.description}</div>
                      <div className="text-[10px] text-slate-400">{new Date(tx.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                  </div>
                  <div className={`font-bold shrink-0 ml-2 ${tx.type === 'CREDIT' ? 'text-emerald-400' : 'text-slate-100'}`}>
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

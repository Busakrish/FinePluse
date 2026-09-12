import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Wallet,
  CreditCard,
  ShoppingBag,
  Utensils,
  Car,
  Zap,
  Tv,
  HeartPulse,
  GraduationCap,
  PiggyBank,
  ChevronRight,
  BotMessageSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Trophy,
  ShieldCheck,
  HelpCircle,
  Clock,
} from 'lucide-react';
import { api } from '../services/api';
import {
  SpendingCoachPayload,
  SpendingCategoryBreakdown,
  SavingOpportunity,
  SpendingChallenge,
} from '../types';

interface SpendingCoachWidgetProps {
  className?: string;
}

export const SpendingCoachWidget: React.FC<SpendingCoachWidgetProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [data, setData] = useState<SpendingCoachPayload | null>(null);
  const [consentRestricted, setConsentRestricted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'CATEGORIES' | 'SAVINGS' | 'CHALLENGES'>('CATEGORIES');
  const [challenges, setChallenges] = useState<SpendingChallenge[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchCoachData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/spending/coach');
        if (!isMounted) return;

        if (res.data?.success) {
          setData(res.data.data);
          setConsentRestricted(Boolean(res.data.consent_restricted));
          if (res.data.data?.challenges) {
            setChallenges(res.data.data.challenges);
          }
        }
      } catch (err) {
        console.warn('Failed to load spending coach data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchCoachData();
    return () => {
      isMounted = false;
    };
  }, []);

  const getCategoryIcon = (category: string) => {
    const c = category.toLowerCase();
    if (c.includes('food') || c.includes('dining')) return Utensils;
    if (c.includes('shop') || c.includes('apparel')) return ShoppingBag;
    if (c.includes('fuel') || c.includes('transport') || c.includes('travel')) return Car;
    if (c.includes('util') || c.includes('bill')) return Zap;
    if (c.includes('entertain')) return Tv;
    if (c.includes('health')) return HeartPulse;
    if (c.includes('educat')) return GraduationCap;
    if (c.includes('emi') || c.includes('loan')) return CreditCard;
    if (c.includes('invest') || c.includes('saving')) return PiggyBank;
    return Wallet;
  };

  const getHealthBadge = (level: string) => {
    switch (level) {
      case 'EXCELLENT':
        return {
          label: 'Excellent Health',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        };
      case 'HEALTHY':
        return {
          label: 'Healthy Budget',
          bg: 'bg-blue-50 text-blue-800 border-blue-300',
          dot: 'bg-blue-500',
        };
      case 'WARNING':
        return {
          label: 'Budget Warning',
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500',
        };
      case 'CRITICAL':
      default:
        return {
          label: 'Critical Strain',
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500',
        };
    }
  };

  const handleAction = (opp: SavingOpportunity) => {
    if (opp.action_route === '/assistant') {
      navigate('/assistant', {
        state: { prompt: `How can I save money on ${opp.category}? Please give me practical coaching for: ${opp.title}.` },
      });
    } else {
      navigate(opp.action_route);
    }
  };

  const handleCompleteChallenge = (challengeId: string) => {
    setChallenges((prev) =>
      prev.map((ch) =>
        ch.id === challengeId ? { ...ch, status: 'COMPLETED', progress_percentage: 100 } : ch
      )
    );
  };

  if (loading) {
    return (
      <div className={`bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-4 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 animate-pulse" />
            <div className="h-5 w-44 bg-slate-200 rounded animate-pulse" />
          </div>
          <div className="h-4 w-28 bg-slate-100 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  // DPDPA Consent Restricted State
  if (consentRestricted) {
    return (
      <div className={`bg-amber-50 border border-amber-200 p-6 rounded-3xl shadow-xs ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900">AI Spending Coach Paused</h3>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                Under your <strong>DPDPA 2023 Consent Center</strong> preferences, <em>Transaction Analysis</em> or <em>Personalized Recommendations</em> are currently disabled. FinPulse AI does not analyze your spending or generate budgeting advice without your permission.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/consent')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-amber-700 hover:bg-amber-800 text-white shrink-0 shadow-xs transition"
          >
            <span>Manage Consent</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { overview, categories, overspending_alerts, saving_opportunities, weekly_trends, forecast, budget_health, budget_coach_tips } = data;
  const healthBadge = getHealthBadge(budget_health.level);

  return (
    <section className={`bg-white border border-slate-200 p-6 rounded-3xl shadow-xs space-y-6 ${className}`} aria-labelledby="spending-coach-heading">
      {/* Top Header & Copilot Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200 uppercase tracking-wider">
              FinPulse AI Coach
            </span>
            <span className="text-xs text-slate-500 font-semibold">• Verified Transaction Intelligence</span>
          </div>
          <h2 id="spending-coach-heading" className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            AI Spending Coach
          </h2>
          <p className="text-xs text-slate-500">
            Real-time cash flow diagnostics, overspending alerts, and actionable habit coaching tailored to your lifestyle.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => navigate('/assistant', { state: { prompt: 'How am I spending this month? Please give me an AI spending coaching report.' } })}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition"
          >
            <BotMessageSquare className="w-4 h-4" />
            <span>Ask Coach in Chat</span>
          </button>
        </div>
      </div>

      {/* Feature 1 & Feature 7: Summary Metrics & Budget Health Meter */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Spent */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Total Spent (Sep)</span>
            <CreditCard className="w-3.5 h-3.5 text-slate-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5">
            ₹{overview.total_spent_this_month.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span>Daily burn: ₹{forecast.burn_rate_daily.toLocaleString('en-IN')}/day</span>
          </div>
        </div>

        {/* Total Income */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Monthly Inflow</span>
            <Wallet className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black text-slate-900 mt-1.5">
            ₹{overview.total_income_this_month.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-indigo-700 font-semibold mt-1">
            <span>Salary &amp; Credits</span>
          </div>
        </div>

        {/* Total Saved */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Net Saved</span>
            <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black text-emerald-800 mt-1.5">
            ₹{overview.total_saved_this_month.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-1">
            <span>{overview.savings_ratio}% Savings Ratio</span>
          </div>
        </div>

        {/* Budget Health Meter */}
        <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
            <span>Budget Health</span>
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-1.5">
            <span className="text-xl font-black text-slate-900">{budget_health.score}</span>
            <span className="text-xs text-slate-500 font-bold">/ 100</span>
          </div>
          <div className="mt-1">
            <span className={`inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full border ${healthBadge.bg}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${healthBadge.dot}`} />
              {healthBadge.label}
            </span>
          </div>
        </div>
      </div>

      {/* AI Overview Narrative Callout */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/40 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">
            {overview.insight_summary}
          </p>
          <p className="text-[11px] text-slate-500">
            {budget_health.explanation}
          </p>
        </div>
      </div>

      {/* Feature 3: Overspending Detection Alerts */}
      {overspending_alerts && overspending_alerts.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-rose-800 uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            <span>Overspending Alerts Detected</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {overspending_alerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-rose-50/70 border border-rose-200 p-4 rounded-2xl space-y-2 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      {alert.title}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${alert.severity === 'HIGH' ? 'bg-rose-200 text-rose-900' : 'bg-amber-100 text-amber-900'}`}>
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-xs text-rose-950 font-medium leading-snug">
                    {alert.message}
                  </p>
                  <p className="text-[11px] text-rose-800/80 leading-relaxed pt-1">
                    <strong>Why FinPulse detected this:</strong> {alert.reason}
                  </p>
                </div>
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-rose-700 font-semibold">Estimated Outflow Surge:</span>
                  <span className="font-mono font-bold text-rose-900">₹{alert.excess_amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Tabs for Deep Exploration */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('CATEGORIES')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeTab === 'CATEGORIES'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          📊 Categories &amp; Trends
        </button>
        <button
          onClick={() => setActiveTab('SAVINGS')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeTab === 'SAVINGS'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          💡 Forecast &amp; Savings ({saving_opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('CHALLENGES')}
          className={`px-3 py-1.5 rounded-xl transition ${
            activeTab === 'CHALLENGES'
              ? 'bg-blue-700 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          🎯 Coaching &amp; Challenges
        </button>
      </div>

      {/* TAB 1: Categories & Weekly Trends */}
      {activeTab === 'CATEGORIES' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Feature 2: Spending Category Analysis Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Spending Breakdown by Category</h3>
              <span className="text-[11px] text-slate-500">Grouped from UPI, Card &amp; NetBanking</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.map((cat) => {
                const IconComponent = getCategoryIcon(cat.category);
                const isIncrease = cat.change_percentage > 0;

                return (
                  <div
                    key={cat.category}
                    className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-2 hover:bg-slate-100/60 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-2xs">
                          <IconComponent className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                      </div>
                      <div className={`inline-flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${isIncrease ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        <span>{isIncrease ? `+${cat.change_percentage}%` : `${cat.change_percentage}%`} MoM</span>
                      </div>
                    </div>

                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-base font-black text-slate-900">
                        ₹{cat.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-slate-500 font-semibold">{cat.percentage}% of spend</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${isIncrease ? 'bg-blue-600' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(100, cat.percentage * 2)}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug pt-0.5">
                      {cat.ai_explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feature 5: Weekly Spending Trends */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Weekly Spending Velocity</h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">This Week vs Last Week</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold">Current Week Total</span>
                <div className="text-base font-black text-slate-900 mt-0.5">
                  ₹{weekly_trends.current_week_total.toLocaleString('en-IN')}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">
                  vs ₹{weekly_trends.previous_week_total.toLocaleString('en-IN')} last week
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold">Biggest Surge Category</span>
                <div className="text-xs font-bold text-rose-700 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{weekly_trends.biggest_increase.category} (+{weekly_trends.biggest_increase.change_percentage}%)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Weekend shopping transactions</div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-500 font-semibold">Biggest Reduction</span>
                <div className="text-xs font-bold text-emerald-700 mt-1 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{weekly_trends.biggest_decrease.category} ({weekly_trends.biggest_decrease.change_percentage}%)</span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1">Lower inter-city fuel debits</div>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-white/80 border border-slate-200 text-xs text-slate-700 flex items-center gap-2">
              <BotMessageSquare className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{weekly_trends.ai_weekly_insight}</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Forecast & Smart Savings */}
      {activeTab === 'SAVINGS' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Feature 6: Spending Forecast Card */}
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Month-End Spending Forecast</h3>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                forecast.status === 'ON_TRACK'
                  ? 'bg-emerald-100 text-emerald-800'
                  : forecast.status === 'AT_RISK'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}>
                Status: {forecast.status.replace('_', ' ')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold">Projected Spend (Month-End)</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  ₹{forecast.projected_spending.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500">Based on verified 12-day run rate</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold">Safe Monthly Budget Limit</span>
                <div className="text-lg font-black text-slate-900 mt-1">
                  ₹{forecast.monthly_budget.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500">Calculated by Financial Twin</span>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                <span className="text-xs text-slate-500 font-semibold">Budget Remaining</span>
                <div className="text-lg font-black text-emerald-800 mt-1">
                  ₹{forecast.budget_remaining.toLocaleString('en-IN')}
                </div>
                <span className="text-[10px] text-slate-500">
                  {forecast.days_until_budget_exhaustion !== null
                    ? `Safe for ~${forecast.days_until_budget_exhaustion} days at current burn`
                    : 'Comfortably protected'}
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200 leading-relaxed">
              {forecast.narrative}
            </p>
          </div>

          {/* Feature 4: Smart Saving Opportunities */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Personalized Smart Saving Opportunities</h3>
              <span className="text-xs text-emerald-700 font-bold">
                Potential Total Savings: ₹{saving_opportunities.reduce((s, o) => s + o.estimated_monthly_savings, 0).toLocaleString('en-IN')}/mo
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {saving_opportunities.map((opp) => (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-200 border-l-4 border-l-emerald-600 p-4 rounded-2xl shadow-2xs space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {opp.category}
                      </span>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        +₹{opp.estimated_monthly_savings.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{opp.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>Why this recommendation:</strong> {opp.why_recommendation}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Verified from your spend habits</span>
                    <button
                      onClick={() => handleAction(opp)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition"
                    >
                      <span>{opp.action_cta}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Coaching Tips & Challenges */}
      {activeTab === 'CHALLENGES' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Feature 8: AI Budget Coach Tips */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Personalized Budget Coach Suggestions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {budget_coach_tips.map((tip) => (
                <div key={tip.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                      {tip.category}
                    </span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{tip.title}</h4>
                  <p className="text-xs text-slate-600 leading-snug">
                    {tip.why_it_matters}
                  </p>
                  <div className="pt-2 border-t border-slate-200/80 text-[11px] space-y-1">
                    <div className="text-emerald-700 font-bold">Impact: {tip.financial_impact}</div>
                    <div className="text-blue-900 font-medium">⚡ Today: {tip.easy_action_today}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Feature 9: Spending Challenges (Gamification) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-slate-900">Active Spending Challenges</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Gamified Bharat Budgeting</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {challenges.map((ch) => {
                const isComplete = ch.status === 'COMPLETED';

                return (
                  <div
                    key={ch.id}
                    className={`p-4 rounded-2xl border transition space-y-3 flex flex-col justify-between ${
                      isComplete ? 'bg-emerald-50/50 border-emerald-200' : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{ch.reward_badge}</span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isComplete ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ch.status}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">{ch.title}</h4>
                      <p className="text-xs text-slate-600 leading-snug">{ch.description}</p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold">
                        <span className="text-slate-500">Progress</span>
                        <span className="text-slate-900 font-bold">{ch.progress_percentage}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${isComplete ? 'bg-emerald-600' : 'bg-blue-600'}`}
                          style={{ width: `${ch.progress_percentage}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between pt-1 text-[11px]">
                        <span className="text-emerald-700 font-bold">Saved: ₹{ch.money_saved}</span>
                        {!isComplete ? (
                          <button
                            onClick={() => handleCompleteChallenge(ch.id)}
                            className="text-[10px] font-bold text-blue-700 hover:text-blue-800 underline"
                          >
                            Mark Complete
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

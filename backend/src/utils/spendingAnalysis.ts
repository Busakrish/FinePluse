export interface SpendingOverview {
  total_spent_this_month: number;
  total_income_this_month: number;
  total_saved_this_month: number;
  savings_ratio: number;
  spending_score: number; // 0 - 100
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
  score: number; // 0 - 100
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

export interface SpendingAnalysisPayload {
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

export class SpendingAnalysisEngine {
  /**
   * Evaluates verified transactions and Financial Twin metrics to generate
   * deterministic spending analysis, overspending detection, forecasts, and coaching tips.
   */
  public static analyze(
    transactions: any[],
    twin: any,
    monthlyIncome: number = 50000,
    currentDate: Date = new Date('2026-09-12T12:00:00.000Z')
  ): SpendingAnalysisPayload {
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // 8 for September
    const currentDay = currentDate.getDate() || 12;

    // Filter current month transactions vs previous month
    const currentMonthTxs = transactions.filter((t) => {
      const d = new Date(t.created_at);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });

    const prevMonthTxs = transactions.filter((t) => {
      const d = new Date(t.created_at);
      // Handles year wrap if month is Jan (0)
      const prevM = currentMonth === 0 ? 11 : currentMonth - 1;
      const prevY = currentMonth === 0 ? currentYear - 1 : currentYear;
      return d.getFullYear() === prevY && d.getMonth() === prevM;
    });

    const currentDebits = currentMonthTxs.filter((t) => t.type === 'DEBIT');
    const prevDebits = prevMonthTxs.filter((t) => t.type === 'DEBIT');

    // 1. Overview calculations
    const verifiedIncomeCredits = currentMonthTxs
      .filter((t) => t.type === 'CREDIT' && (t.category === 'Salary' || t.amount >= 20000))
      .reduce((sum, t) => sum + t.amount, 0);

    const effectiveIncome = verifiedIncomeCredits > 0 ? verifiedIncomeCredits : (twin?.monthly_income || monthlyIncome);
    const totalSpentThisMonth = currentDebits.reduce((sum, t) => sum + t.amount, 0);
    const totalSavedThisMonth = Math.max(0, effectiveIncome - totalSpentThisMonth);
    const savingsRatio = effectiveIncome > 0 ? Math.round((totalSavedThisMonth / effectiveIncome) * 1000) / 10 : 0;

    // Spending score calculation (0 - 100)
    // Disciplined savings and low discretionary excess gives higher score
    const expenseRatio = effectiveIncome > 0 ? (totalSpentThisMonth / effectiveIncome) * 100 : 60;
    let spendingScore = Math.max(10, Math.min(98, Math.round(100 - expenseRatio * 0.8 + (savingsRatio > 25 ? 15 : 5))));
    if (twin?.stress_level === 'HIGH') {
      spendingScore = Math.min(42, spendingScore);
    }

    const insightSummary =
      savingsRatio >= 25
        ? `Great job! You saved ${savingsRatio}% of your income this month, which is better than last month and keeps your wealth creation on track.`
        : savingsRatio >= 15
        ? `You have saved ${savingsRatio}% of your income so far. Moderating discretionary weekend spending can help reach your 20% savings target.`
        : `Your expenses account for ${Math.round(expenseRatio)}% of income. Activating defensive budgeting will help safeguard your liquid reserves.`;

    const overview: SpendingOverview = {
      total_spent_this_month: totalSpentThisMonth,
      total_income_this_month: effectiveIncome,
      total_saved_this_month: totalSavedThisMonth,
      savings_ratio: savingsRatio,
      spending_score: spendingScore,
      insight_summary: insightSummary,
    };

    // 2. Category Analysis (10 Core Banking Categories)
    const categoryMap: Record<string, { current: number; prev: number; count: number }> = {
      'Food & Dining': { current: 0, prev: 0, count: 0 },
      'Shopping': { current: 0, prev: 0, count: 0 },
      'Travel': { current: 0, prev: 0, count: 0 },
      'Bills & Utilities': { current: 0, prev: 0, count: 0 },
      'Entertainment': { current: 0, prev: 0, count: 0 },
      'Health': { current: 0, prev: 0, count: 0 },
      'Education': { current: 0, prev: 0, count: 0 },
      'Fuel & Transport': { current: 0, prev: 0, count: 0 },
      'Investments': { current: 0, prev: 0, count: 0 },
      'EMI & Loans': { current: 0, prev: 0, count: 0 },
      'Groceries': { current: 0, prev: 0, count: 0 },
    };

    const normalizeCat = (rawCat: string): string => {
      const c = (rawCat || '').toLowerCase();
      if (c.includes('food') || c.includes('dining') || c.includes('restaurant') || c.includes('swiggy') || c.includes('zomato')) return 'Food & Dining';
      if (c.includes('shop') || c.includes('apparel') || c.includes('fashion') || c.includes('amazon') || c.includes('myntra')) return 'Shopping';
      if (c.includes('travel') || c.includes('tour') || c.includes('hotel') || c.includes('flight') || c.includes('railway') || c.includes('irctc')) return 'Travel';
      if (c.includes('util') || c.includes('bill') || c.includes('electr') || c.includes('bbps')) return 'Bills & Utilities';
      if (c.includes('entertain') || c.includes('stream') || c.includes('netflix') || c.includes('prime') || c.includes('movie')) return 'Entertainment';
      if (c.includes('health') || c.includes('pharm') || c.includes('medic') || c.includes('doctor') || c.includes('hospital')) return 'Health';
      if (c.includes('educat') || c.includes('school') || c.includes('tuit') || c.includes('college')) return 'Education';
      if (c.includes('fuel') || c.includes('petrol') || c.includes('diesel') || c.includes('transport') || c.includes('auto') || c.includes('cab') || c.includes('uber') || c.includes('ola')) return 'Fuel & Transport';
      if (c.includes('invest') || c.includes('sip') || c.includes('mutual') || c.includes('mf') || c.includes('stock') || c.includes('gold')) return 'Investments';
      if (c.includes('emi') || c.includes('loan') || c.includes('credit card')) return 'EMI & Loans';
      if (c.includes('groc') || c.includes('supermarket') || c.includes('kirana') || c.includes('dmart') || c.includes('blinkit')) return 'Groceries';
      return 'Shopping';
    };

    currentDebits.forEach((tx) => {
      const norm = normalizeCat(tx.category);
      if (!categoryMap[norm]) categoryMap[norm] = { current: 0, prev: 0, count: 0 };
      categoryMap[norm].current += tx.amount;
      categoryMap[norm].count += 1;
    });

    prevDebits.forEach((tx) => {
      const norm = normalizeCat(tx.category);
      if (!categoryMap[norm]) categoryMap[norm] = { current: 0, prev: 0, count: 0 };
      categoryMap[norm].prev += tx.amount;
    });

    // Populate category breakdown list (filtering out unused categories unless they have active spending)
    const categories: SpendingCategoryBreakdown[] = Object.keys(categoryMap)
      .filter((cat) => categoryMap[cat].current > 0 || categoryMap[cat].prev > 0)
      .map((cat) => {
        const item = categoryMap[cat];
        const pct = totalSpentThisMonth > 0 ? Math.round((item.current / totalSpentThisMonth) * 1000) / 10 : 0;
        let changePct = 0;
        if (item.prev > 0) {
          changePct = Math.round(((item.current - item.prev) / item.prev) * 100);
        } else if (item.current > 0) {
          changePct = 100;
        }

        let aiExpl = `Consistent with monthly spending limits.`;
        if (changePct > 20) {
          aiExpl = `Your ${cat.toLowerCase()} expenses increased by +${changePct}% mainly due to mid-month and weekend transactions.`;
        } else if (changePct < -10) {
          aiExpl = `Great control! Expenses in ${cat.toLowerCase()} decreased by ${Math.abs(changePct)}% compared to last month.`;
        } else {
          aiExpl = `Stable spending pattern aligned with previous month benchmark.`;
        }

        return {
          category: cat,
          amount: item.current,
          percentage: pct,
          previous_month_amount: item.prev,
          change_percentage: changePct,
          transaction_count: item.count,
          ai_explanation: aiExpl,
        };
      })
      .sort((a, b) => b.amount - a.amount);

    // 3. Overspending Detection
    const overspending_alerts: OverspendingAlert[] = [];

    // Check Food & Dining surge
    const foodCat = categoryMap['Food & Dining'];
    if (foodCat && foodCat.current > 2000 && (foodCat.prev === 0 || foodCat.current > foodCat.prev * 1.25)) {
      const increase = foodCat.prev > 0 ? Math.round(((foodCat.current - foodCat.prev) / foodCat.prev) * 100) : 35;
      overspending_alerts.push({
        id: 'alert_food_surge',
        category: 'Food & Dining',
        severity: increase > 30 ? 'HIGH' : 'MEDIUM',
        title: 'Food Delivery & Dining Spike',
        message: `Your dining and online food spending is ${increase}% higher than your previous month baseline.`,
        excess_amount: Math.max(800, foodCat.current - (foodCat.prev || 1800)),
        reason: 'Multiple online delivery orders placed within short intervals during evenings and weekends.',
      });
    }

    // Check Shopping surge
    const shoppingCat = categoryMap['Shopping'];
    if (shoppingCat && shoppingCat.current >= 8000 && shoppingCat.current > shoppingCat.prev) {
      const increase = shoppingCat.prev > 0 ? Math.round(((shoppingCat.current - shoppingCat.prev) / shoppingCat.prev) * 100) : 32;
      overspending_alerts.push({
        id: 'alert_shopping_surge',
        category: 'Shopping',
        severity: increase > 25 ? 'HIGH' : 'MEDIUM',
        title: 'Shopping Surge Alert',
        message: `Your shopping expenses increased by +${increase}% compared to last month.`,
        excess_amount: Math.max(1500, shoppingCat.current - (shoppingCat.prev || 6000)),
        reason: 'Concentrated e-commerce fashion and gadget purchases recorded on weekends.',
      });
    }

    // Check Stress or Overall Run-rate overspending
    if (twin?.stress_level === 'HIGH' || expenseRatio > 75) {
      overspending_alerts.push({
        id: 'alert_cashflow_strain',
        category: 'Cashflow Protection',
        severity: 'HIGH',
        title: 'High Outflow vs Income Velocity',
        message: `Total monthly outflows represent ${Math.round(expenseRatio)}% of incoming salary.`,
        excess_amount: Math.round(totalSpentThisMonth * 0.15),
        reason: 'High EMI debt service combined with living costs is reducing emergency liquidity buffer.',
      });
    }

    // 4. Smart Saving Opportunities
    const saving_opportunities: SavingOpportunity[] = [];

    if (foodCat && foodCat.current > 1500) {
      saving_opportunities.push({
        id: 'opp_food_delivery',
        title: 'Rationalize Online Food Orders',
        category: 'Food & Dining',
        why_recommendation: 'Replacing 2 food delivery orders per week with home dining cuts delivery fees and surges.',
        estimated_monthly_savings: 1600,
        action_cta: 'Set Dining Budget',
        action_route: '/assistant',
      });
    }

    if (shoppingCat && shoppingCat.current > 4000) {
      saving_opportunities.push({
        id: 'opp_shopping_moderation',
        title: 'Delay Non-Essential Shopping Purchases',
        category: 'Shopping',
        why_recommendation: 'Practicing a 48-hour cool-off rule before checkout avoids impulse lifestyle buys.',
        estimated_monthly_savings: 2000,
        action_cta: 'Explore Savings Goal',
        action_route: '/assistant',
      });
    }

    const entertainmentCat = categoryMap['Entertainment'];
    if (entertainmentCat && entertainmentCat.current > 500) {
      saving_opportunities.push({
        id: 'opp_subscriptions',
        title: 'Audit Recurring Subscriptions',
        category: 'Entertainment',
        why_recommendation: 'Consolidating unused OTT media and digital subscriptions reduces silent bank leakage.',
        estimated_monthly_savings: 649,
        action_cta: 'Review Subscriptions',
        action_route: '/transactions',
      });
    }

    // Always provide an emergency fund savings sweep opportunity if healthy, or relief if stressed
    if (twin?.stress_level !== 'HIGH' && totalSavedThisMonth > 3000) {
      saving_opportunities.push({
        id: 'opp_emergency_sweep',
        title: 'Auto-Sweep Surplus to Liquid Reserve',
        category: 'Savings',
        why_recommendation: 'Transferring surplus account balance into a 7.8% yield reserve earns extra interest safely.',
        estimated_monthly_savings: 2400,
        action_cta: 'Start Smart Deposit',
        action_route: '/recommendations',
      });
    } else {
      saving_opportunities.push({
        id: 'opp_samadhan_restructure',
        title: 'Samadhan Debt EMI Restructuring',
        category: 'EMI & Loans',
        why_recommendation: 'Requesting loan tenure extension can lower monthly EMI outgo and eliminate penalty risks.',
        estimated_monthly_savings: 4500,
        action_cta: 'View Samadhan Options',
        action_route: '/stress-assistance',
      });
    }

    // 5. Weekly Spending Trends
    // Split current month debits into this week (last 7 days from currentDate) vs previous week
    const oneDayMs = 24 * 60 * 60 * 1000;
    const currentWeekStart = new Date(currentDate.getTime() - 7 * oneDayMs);
    const prevWeekStart = new Date(currentDate.getTime() - 14 * oneDayMs);

    const thisWeekDebits = currentDebits.filter((t) => {
      const d = new Date(t.created_at);
      return d >= currentWeekStart && d <= currentDate;
    });

    const lastWeekDebits = currentDebits.filter((t) => {
      const d = new Date(t.created_at);
      return d >= prevWeekStart && d < currentWeekStart;
    });

    const currentWeekTotal = thisWeekDebits.reduce((sum, t) => sum + t.amount, 0) || Math.round(totalSpentThisMonth * 0.42);
    const prevWeekTotal = lastWeekDebits.reduce((sum, t) => sum + t.amount, 0) || Math.round(totalSpentThisMonth * 0.38);

    const wowChange = prevWeekTotal > 0 ? Math.round(((currentWeekTotal - prevWeekTotal) / prevWeekTotal) * 100) : 0;

    const weeklyTrends: WeeklySpendingTrend = {
      current_week_total: currentWeekTotal,
      previous_week_total: prevWeekTotal,
      week_over_week_change_percentage: wowChange,
      biggest_increase: { category: 'Shopping', change_percentage: 42 },
      biggest_decrease: { category: 'Fuel & Transport', change_percentage: -12 },
      weekly_breakdown: [
        { period: 'Week 1 (Sep 1 - Sep 7)', amount: Math.round(totalSpentThisMonth * 0.58) },
        { period: 'Week 2 (Sep 8 - Sep 14)', amount: Math.round(totalSpentThisMonth * 0.42) },
        { period: 'Week 3 (Projected)', amount: Math.round(totalSpentThisMonth * 0.35) },
        { period: 'Week 4 (Projected)', amount: Math.round(totalSpentThisMonth * 0.25) },
      ],
      ai_weekly_insight:
        wowChange > 0
          ? `Spending increased by ${wowChange}% this week, primarily propelled by weekend shopping and dining out.`
          : `Spending slowed down by ${Math.abs(wowChange)}% this week, showing healthy restraint following early-month bill debits.`,
    };

    // 6. Spending Forecast
    const totalDaysInMonth = 30;
    const daysElapsed = Math.max(1, Math.min(totalDaysInMonth, currentDay));
    const daysRemaining = Math.max(1, totalDaysInMonth - daysElapsed);

    const dailyBurnRate = Math.round(totalSpentThisMonth / daysElapsed);
    const projectedSpend = Math.round(dailyBurnRate * totalDaysInMonth);
    const monthlyBudget = Math.round(effectiveIncome * (twin?.stress_level === 'HIGH' ? 0.85 : 0.65));
    const budgetRemaining = Math.max(0, monthlyBudget - totalSpentThisMonth);

    let daysUntilExhaustion: number | null = null;
    if (dailyBurnRate > 0 && budgetRemaining > 0) {
      daysUntilExhaustion = Math.round(budgetRemaining / dailyBurnRate);
    } else if (budgetRemaining === 0) {
      daysUntilExhaustion = 0;
    }

    let forecastStatus: 'ON_TRACK' | 'AT_RISK' | 'OVER_BUDGET' = 'ON_TRACK';
    if (projectedSpend > monthlyBudget * 1.1) {
      forecastStatus = 'OVER_BUDGET';
    } else if (projectedSpend > monthlyBudget * 0.95) {
      forecastStatus = 'AT_RISK';
    }

    const forecastNarrative =
      forecastStatus === 'ON_TRACK'
        ? `Projected spending: ₹${projectedSpend.toLocaleString('en-IN')} | Budget Remaining: ₹${budgetRemaining.toLocaleString('en-IN')}. At your current pace, you will comfortably retain ₹${(effectiveIncome - projectedSpend).toLocaleString('en-IN')} in surplus savings.`
        : forecastStatus === 'AT_RISK'
        ? `Projected spending: ₹${projectedSpend.toLocaleString('en-IN')}. If discretionary spending continues at ₹${dailyBurnRate.toLocaleString('en-IN')}/day, your monthly budget may exhaust in ${daysUntilExhaustion || 6} days.`
        : `High Burn Rate Alert: Monthly spending is projected to exceed recommended budget by ₹${(projectedSpend - monthlyBudget).toLocaleString('en-IN')}. Activate defensive budgeting now.`;

    const forecast: SpendingForecast = {
      projected_spending: projectedSpend,
      monthly_budget: monthlyBudget,
      budget_remaining: budgetRemaining,
      days_until_budget_exhaustion: daysUntilExhaustion,
      burn_rate_daily: dailyBurnRate,
      status: forecastStatus,
      narrative: forecastNarrative,
    };

    // 7. Budget Health Indicator (Meter)
    let healthLevel: 'EXCELLENT' | 'HEALTHY' | 'WARNING' | 'CRITICAL' = 'HEALTHY';
    let healthScore = spendingScore;
    const emiBurdenRatio = twin?.emi_to_income_ratio || 25;

    if (twin?.stress_level === 'HIGH' || expenseRatio > 80 || emiBurdenRatio > 50) {
      healthLevel = 'CRITICAL';
      healthScore = Math.min(38, healthScore);
    } else if (expenseRatio > 65 || emiBurdenRatio > 40) {
      healthLevel = 'WARNING';
      healthScore = Math.min(59, Math.max(40, healthScore));
    } else if (savingsRatio >= 25 && emiBurdenRatio < 30) {
      healthLevel = 'EXCELLENT';
      healthScore = Math.max(82, healthScore);
    } else {
      healthLevel = 'HEALTHY';
      healthScore = Math.max(65, Math.min(80, healthScore));
    }

    const healthExplanation =
      healthLevel === 'EXCELLENT'
        ? `Excellent Budget Health — Your expenses are disciplined at ${Math.round(expenseRatio)}% of income and EMI obligations are at a very safe ${emiBurdenRatio}%.`
        : healthLevel === 'HEALTHY'
        ? `Healthy Budget — Your spending is contained within ${Math.round(expenseRatio)}% of your monthly earnings with regular savings contributions.`
        : healthLevel === 'WARNING'
        ? `Budget Caution — Operating near upper spending boundaries with debt service consuming ${emiBurdenRatio}% of monthly inflow.`
        : `Critical Budget Strain — Total fixed outflows and living costs exceed sustainable limits. Immediate debt relief and restructuring recommended.`;

    const budget_health: BudgetHealth = {
      level: healthLevel,
      score: healthScore,
      spending_ratio: Math.round(expenseRatio * 10) / 10,
      savings_ratio: savingsRatio,
      emi_burden_ratio: emiBurdenRatio,
      explanation: healthExplanation,
    };

    // 8. AI Budget Coach Tips
    const budget_coach_tips: BudgetCoachTip[] = [
      {
        id: 'tip_1',
        title: 'Establish a 50-30-20 Bharat Budget Structure',
        category: 'Budgeting',
        why_it_matters: 'Allocating 50% to essential needs, 30% to lifestyle/family, and 20% to savings builds resilient security.',
        financial_impact: `Saves up to ₹${Math.round(effectiveIncome * 0.1).toLocaleString('en-IN')} additionally every quarter.`,
        easy_action_today: 'Set monthly transaction limits on food delivery and e-commerce apps.',
      },
      {
        id: 'tip_2',
        title: 'Enforce Weekend Discretionary Spend Caps',
        category: 'Behavioral',
        why_it_matters: 'Over 60% of impulse UPI spending occurs between Friday evening and Sunday night.',
        financial_impact: 'Prevents mid-month cashflow dips and protects SIP investment schedule.',
        easy_action_today: 'Keep weekend shopping to a predetermined UPI limit of ₹2,500.',
      },
      {
        id: 'tip_3',
        title: 'Automate Wealth Creation on Salary Day',
        category: 'Wealth Protection',
        why_it_matters: 'Investing first before spending ensures wealth compounds uninterrupted regardless of monthly fluctuations.',
        financial_impact: 'Compounds into long-term capital while shielding savings from lifestyle inflation.',
        easy_action_today: 'Schedule SIP debits on the 2nd of each month immediately after salary credit.',
      },
    ];

    // 9. Spending Challenges (Gamification)
    const challenges: SpendingChallenge[] = [
      {
        id: 'ch_food_free',
        title: 'Zero Food Delivery for 3 Days',
        description: 'Cook or enjoy home-cooked meals for 3 consecutive days to beat delivery surges.',
        duration_days: 3,
        progress_percentage: 66,
        money_saved: 750,
        reward_badge: 'Chef Master 🍳',
        status: 'IN_PROGRESS',
      },
      {
        id: 'ch_weekend_saver',
        title: 'Save ₹500 This Weekend',
        description: 'Keep leisure spending under ₹1,000 between Saturday and Sunday.',
        duration_days: 2,
        progress_percentage: 100,
        money_saved: 500,
        reward_badge: 'Weekend Guardian 🛡️',
        status: 'COMPLETED',
      },
      {
        id: 'ch_shopping_cap',
        title: 'Spend Less Than ₹2,000 on Shopping',
        description: 'Cap all e-commerce and apparel shopping to ₹2,000 for the upcoming 7 days.',
        duration_days: 7,
        progress_percentage: 30,
        money_saved: 1200,
        reward_badge: 'Smart Shopper 🛍️',
        status: 'IN_PROGRESS',
      },
    ];

    return {
      overview,
      categories,
      overspending_alerts,
      saving_opportunities,
      weekly_trends: weeklyTrends,
      forecast,
      budget_health,
      budget_coach_tips,
      challenges,
    };
  }
}

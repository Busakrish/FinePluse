export type LifeEventCategory =
  | 'CAREER'
  | 'HOUSING'
  | 'FAMILY'
  | 'EDUCATION'
  | 'HEALTH'
  | 'VEHICLE'
  | 'TRAVEL'
  | 'STRESS_RELIEF';

export interface LifeEventPrediction {
  id: string;
  event_type: string;
  category: LifeEventCategory;
  title: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidence_score: number; // 0 - 100%
  detected_signals: string[];
  why_detected: string;
  recommendation: {
    title: string;
    product_type: string;
    description: string;
    benefit: string;
  };
  action: {
    label: string;
    route: string;
    query_prompt: string;
  };
}

export interface CustomerContextForRules {
  customerId: string;
  profile: any;
  account: any;
  transactions: any[];
  loans: any[];
  twin: any;
  stress: any;
  consent: any;
}

export class LifeEventRules {
  /**
   * Rule 1: First Salary / Career Progression
   */
  public static evaluateFirstSalary(ctx: CustomerContextForRules): LifeEventPrediction | null {
    const isSalaryAcc = ctx.account?.account_type === 'SALARY';
    const salaryTxns = ctx.transactions.filter(
      (t) => t.type === 'CREDIT' && (t.category === 'Salary' || t.description?.toLowerCase().includes('salary'))
    );

    if (!isSalaryAcc && salaryTxns.length === 0 && !ctx.profile.monthly_income) {
      return null;
    }

    const signals: string[] = [];
    if (isSalaryAcc) signals.push(`Designated ${ctx.account?.account_type} Account`);
    if (salaryTxns.length > 0) signals.push(`Recurring monthly payroll credit: ₹${salaryTxns[0].amount.toLocaleString('en-IN')}`);
    signals.push(`Verified monthly inflow: ₹${ctx.profile.monthly_income?.toLocaleString('en-IN')}`);

    const isHighSurplus = (ctx.twin?.savings_ratio || 0) >= 30;

    return {
      id: `lep_salary_${ctx.customerId}`,
      event_type: 'FIRST_SALARY_OR_CAREER_MILESTONE',
      category: 'CAREER',
      title: 'Career Income Stability & Growth',
      confidence: salaryTxns.length > 0 && isSalaryAcc ? 'HIGH' : 'MEDIUM',
      confidence_score: salaryTxns.length > 0 && isSalaryAcc ? 94 : 78,
      detected_signals: signals,
      why_detected: `Consistent salary inflow of ₹${ctx.profile.monthly_income?.toLocaleString('en-IN')} verified on the 1st of every month with ${isHighSurplus ? 'a healthy 40%+ savings rate' : 'steady employment credentials'}.`,
      recommendation: {
        title: isHighSurplus ? 'Bharat Samriddhi Digital Gold SIP' : 'Suraksha 3-Month Emergency Reserve',
        product_type: isHighSurplus ? 'INVESTMENT' : 'SAVINGS',
        description: isHighSurplus
          ? 'Automate fractional digital gold investments from your monthly salary surplus to accelerate wealth accumulation.'
          : 'Build a liquid 3-month safety buffer to protect your career income from sudden expenses.',
        benefit: isHighSurplus ? '11.5% historical annualized yield with sovereign backing' : 'Zero-penalty liquid interest at 7.8% per annum',
      },
      action: {
        label: isHighSurplus ? 'Start Gold SIP' : 'Build Emergency Buffer',
        route: '/recommendations',
        query_prompt: 'How should I invest my monthly salary surplus?',
      },
    };
  }

  /**
   * Rule 2: Home Buyer Journey
   */
  public static evaluateHomeBuyer(ctx: CustomerContextForRules): LifeEventPrediction | null {
    // If under high stress, suppress loan journeys per anti-predatory rule!
    if (ctx.twin?.dont_sell_me_active || ctx.stress?.stress_level === 'HIGH') {
      return null;
    }

    const hasHealthySurplus = (ctx.twin?.monthly_surplus || 0) >= 15000;
    const hasLowDti = (ctx.twin?.emi_to_income_ratio || 0) <= 30;
    const isTeacherOrStable = ctx.profile?.persona_tag === 'WHATIF' || ctx.profile?.monthly_income >= 45000;

    if (!hasHealthySurplus || !hasLowDti || !isTeacherOrStable) {
      return null;
    }

    const signals = [
      `Monthly disposable surplus: ₹${Math.round(ctx.twin?.monthly_surplus || 0).toLocaleString('en-IN')}`,
      `Low existing debt-to-income ratio: ${ctx.twin?.emi_to_income_ratio || 0}% (Safe benchmark < 35%)`,
      `Stable occupation profile: ${ctx.profile?.occupation || 'Salaried'}`,
    ];

    return {
      id: `lep_home_${ctx.customerId}`,
      event_type: 'HOME_BUYER_JOURNEY',
      category: 'HOUSING',
      title: 'Home Buyer & Renovation Readiness',
      confidence: ctx.profile?.persona_tag === 'WHATIF' ? 'HIGH' : 'MEDIUM',
      confidence_score: ctx.profile?.persona_tag === 'WHATIF' ? 91 : 82,
      detected_signals: signals,
      why_detected: `Your disposable surplus of ₹${Math.round(ctx.twin?.monthly_surplus || 0).toLocaleString('en-IN')} and low existing EMI commitments (${ctx.twin?.emi_to_income_ratio || 0}%) indicate strong borrowing capacity for property purchase or renovation.`,
      recommendation: {
        title: 'Home & Renovation Pre-Eligibility Check',
        product_type: 'MORTGAGE',
        description: 'Simulate down payment timelines, subsidy benefits (PMAY), and calculate exact EMIs with zero impact on credit health.',
        benefit: 'Lock in competitive 8.4% home interest rates with pre-underwritten sanction capability',
      },
      action: {
        label: 'Check Home Loan in What-If',
        route: '/what-if',
        query_prompt: 'Can I afford a home loan with my current surplus?',
      },
    };
  }

  /**
   * Rule 3: Marriage & Family Formation
   */
  public static evaluateMarriage(ctx: CustomerContextForRules): LifeEventPrediction | null {
    if (ctx.twin?.dont_sell_me_active || ctx.stress?.stress_level === 'HIGH') return null;

    const jewelryOrEventTxn = ctx.transactions.find((t) => {
      const desc = t.description?.toLowerCase() || '';
      const cat = t.category?.toLowerCase() || '';
      return (
        cat === 'shopping' &&
        (desc.includes('jewelry') ||
          desc.includes('jewel') ||
          desc.includes('tanishq') ||
          desc.includes('kalyan') ||
          desc.includes('saree') ||
          desc.includes('wedding') ||
          desc.includes('event'))
      );
    });

    // Also trigger for young salaried personas with strong savings milestones
    const isPrimeDemographic =
      ctx.profile?.persona_tag === 'HEALTHY' ||
      (ctx.profile?.monthly_income >= 40000 && (ctx.twin?.savings_ratio || 0) >= 35);

    if (!jewelryOrEventTxn && !isPrimeDemographic) {
      return null;
    }

    const signals = jewelryOrEventTxn
      ? [
          `Wedding & milestone expense detected: ₹${jewelryOrEventTxn.amount.toLocaleString('en-IN')} (${jewelryOrEventTxn.description})`,
          `Consistent savings habit (${ctx.twin?.savings_ratio || 35}% savings ratio)`,
        ]
      : [
          `Strong accumulated liquidity with disciplined savings rate of ${ctx.twin?.savings_ratio || 40}%`,
          `Age and income profile aligns with family formation planning`,
        ];

    return {
      id: `lep_marriage_${ctx.customerId}`,
      event_type: 'MARRIAGE_AND_FAMILY_FORMATION',
      category: 'FAMILY',
      title: 'Family Formation & Milestone Planning',
      confidence: jewelryOrEventTxn ? 'HIGH' : 'MEDIUM',
      confidence_score: jewelryOrEventTxn ? 89 : 76,
      detected_signals: signals,
      why_detected: jewelryOrEventTxn
        ? `Detected celebration and lifestyle transactions (${jewelryOrEventTxn.description}) combined with your steady monthly savings.`
        : `Your strong financial runway and disposable liquidity indicate preparation for major family milestone goals.`,
      recommendation: {
        title: 'Joint Savings & Wedding Goal Builder',
        product_type: 'SAVINGS',
        description: 'Create zero-fee joint accounts with dual debit cards and target-based wedding milestone recurring deposits.',
        benefit: '7.8% interest with dedicated goal tracking and partner co-management',
      },
      action: {
        label: 'Explore Joint Savings Goal',
        route: '/recommendations',
        query_prompt: 'How should I plan savings for an upcoming family wedding?',
      },
    };
  }

  /**
   * Rule 4: Child Education Planning
   */
  public static evaluateEducation(ctx: CustomerContextForRules): LifeEventPrediction | null {
    const eduTxn = ctx.transactions.find((t) => {
      const desc = t.description?.toLowerCase() || '';
      const cat = t.category?.toLowerCase() || '';
      return (
        cat === 'education' ||
        desc.includes('school') ||
        desc.includes('tuition') ||
        desc.includes('fees') ||
        desc.includes('academy') ||
        desc.includes('education') ||
        desc.includes('books')
      );
    });

    const isEducatorOrParent = ctx.profile?.persona_tag === 'WHATIF' || ctx.profile?.occupation?.toLowerCase().includes('teacher');

    if (!eduTxn && !isEducatorOrParent) {
      return null;
    }

    const signals = [
      isEducatorOrParent ? 'Education sector professional profile' : 'Tuition & school fee transactions observed',
      `Monthly recurring surplus available: ₹${Math.round(ctx.twin?.monthly_surplus || 10000).toLocaleString('en-IN')}`,
    ];

    return {
      id: `lep_edu_${ctx.customerId}`,
      event_type: 'CHILD_EDUCATION_PLANNING',
      category: 'EDUCATION',
      title: 'Higher Education & Child Future Fund',
      confidence: isEducatorOrParent ? 'HIGH' : 'MEDIUM',
      confidence_score: 85,
      detected_signals: signals,
      why_detected: 'Verified recurring educational expenses or long-term family stability indicators detected in customer profile.',
      recommendation: {
        title: 'Vidya Samriddhi Child Education Deposit',
        product_type: 'INVESTMENT',
        description: 'Automated compounded education growth deposit with tax deductions under Section 80C and scheduled maturity.',
        benefit: 'Targeted maturity payout matching college admission cycles with 8.2% guaranteed return',
      },
      action: {
        label: 'Plan Education Goal',
        route: '/what-if',
        query_prompt: 'How much should I save monthly for child education?',
      },
    };
  }

  /**
   * Rule 5: Health & Family Protection
   */
  public static evaluateHealthProtection(ctx: CustomerContextForRules): LifeEventPrediction | null {
    const healthTxns = ctx.transactions.filter((t) => {
      const desc = t.description?.toLowerCase() || '';
      const cat = t.category?.toLowerCase() || '';
      return (
        cat === 'healthcare' ||
        desc.includes('hospital') ||
        desc.includes('pharmacy') ||
        desc.includes('apollo') ||
        desc.includes('clinic') ||
        desc.includes('med')
      );
    });

    if (healthTxns.length === 0 && (ctx.twin?.financial_health_score || 70) > 75) {
      return null;
    }

    const totalHealthSpend = healthTxns.reduce((sum, t) => sum + t.amount, 0);
    const signals = [
      `Healthcare & medical outflows detected: ₹${totalHealthSpend.toLocaleString('en-IN')} across ${healthTxns.length || 1} transactions`,
      `Liquid cushion evaluation: ${Math.round((ctx.account?.balance || 5000) / (ctx.twin?.monthly_expenses || 20000))} months of expense runway`,
    ];

    return {
      id: `lep_health_${ctx.customerId}`,
      event_type: 'HEALTH_AND_FAMILY_PROTECTION',
      category: 'HEALTH',
      title: 'Family Health & Medical Shield',
      confidence: healthTxns.length > 0 ? 'HIGH' : 'MEDIUM',
      confidence_score: healthTxns.length > 0 ? 92 : 75,
      detected_signals: signals,
      why_detected: healthTxns.length > 0
        ? `Out-of-pocket medical payments totaling ₹${totalHealthSpend.toLocaleString('en-IN')} detected, indicating a need for cashless hospitalization cover.`
        : `Maintaining health protection is vital to prevent sudden medical shocks from depleting your savings.`,
      recommendation: {
        title: 'Arogya Suraksha Comprehensive Family Health Cover',
        product_type: 'INSURANCE',
        description: '₹10 Lakh cashless family hospitalization coverage across 12,000+ network hospitals in Tier 2/3/4 towns.',
        benefit: 'Zero deductible with automated claim settlement and day-1 pre-existing coverage',
      },
      action: {
        label: 'Explore Health Protection',
        route: '/recommendations',
        query_prompt: 'Why do you recommend family health insurance for my profile?',
      },
    };
  }

  /**
   * Rule 6: Vehicle Purchase Journey
   */
  public static evaluateVehicle(ctx: CustomerContextForRules): LifeEventPrediction | null {
    if (ctx.twin?.dont_sell_me_active || ctx.stress?.stress_level === 'HIGH') return null;

    const existingVehicleLoan = ctx.loans.find((l) => l.loan_type === 'VEHICLE' && l.status === 'ACTIVE');
    const fuelOrAutoTxn = ctx.transactions.find((t) => {
      const desc = t.description?.toLowerCase() || '';
      return desc.includes('fuel') || desc.includes('petrol') || desc.includes('hpcl') || desc.includes('motors') || desc.includes('auto');
    });

    if (!existingVehicleLoan && !fuelOrAutoTxn) {
      return null;
    }

    const signals = existingVehicleLoan
      ? [
          `Active Vehicle Loan: ₹${existingVehicleLoan.monthly_emi.toLocaleString('en-IN')}/mo (Current outstanding: ₹${existingVehicleLoan.outstanding_amount.toLocaleString('en-IN')})`,
          'Timely repayments on vehicle financing over last 18+ months',
        ]
      : [
          'Regular transport and fuel consumption patterns detected',
          `Disposable surplus of ₹${Math.round(ctx.twin?.monthly_surplus || 0).toLocaleString('en-IN')} suitable for two-wheeler financing`,
        ];

    return {
      id: `lep_vehicle_${ctx.customerId}`,
      event_type: 'VEHICLE_OWNERSHIP_AND_UPGRADE',
      category: 'VEHICLE',
      title: existingVehicleLoan ? 'Vehicle Loan Optimization & Refinance' : 'Two-Wheeler & Auto Financing Opportunity',
      confidence: 'HIGH',
      confidence_score: 90,
      detected_signals: signals,
      why_detected: existingVehicleLoan
        ? `You have a pristine repayment track record on your Vehicle Loan (₹${existingVehicleLoan.monthly_emi.toLocaleString('en-IN')}/mo) with zero missed EMIs.`
        : `Verified fuel and commute expenses show a strong lifestyle need for automated two-wheeler ownership.`,
      recommendation: {
        title: existingVehicleLoan ? 'Zero-Depreciation Vehicle Insurance Renewal' : 'Instant Pre-Approved Two-Wheeler Credit',
        product_type: existingVehicleLoan ? 'INSURANCE' : 'LOAN',
        description: existingVehicleLoan
          ? 'Reduce your annual comprehensive vehicle insurance premium by up to 22% with no-claim bonus protection.'
          : 'Low-interest 7.9% two-wheeler financing tailored for Bharat commutes with zero paperwork.',
        benefit: existingVehicleLoan ? 'Instant roadside assistance and cashless garage network' : 'Affordable EMI of ~₹2,200/mo aligned with your cashflow',
      },
      action: {
        label: existingVehicleLoan ? 'Optimize Vehicle Policy' : 'Simulate Vehicle EMI',
        route: existingVehicleLoan ? '/recommendations' : '/what-if',
        query_prompt: 'What are my vehicle loan and insurance options?',
      },
    };
  }

  /**
   * Rule 7: Travel Goal Detection
   */
  public static evaluateTravel(ctx: CustomerContextForRules): LifeEventPrediction | null {
    if (ctx.twin?.dont_sell_me_active || ctx.stress?.stress_level === 'HIGH') return null;

    const travelTxn = ctx.transactions.find((t) => {
      const desc = t.description?.toLowerCase() || '';
      return (
        desc.includes('travel') ||
        desc.includes('flight') ||
        desc.includes('makemytrip') ||
        desc.includes('irctc') ||
        desc.includes('hotel') ||
        desc.includes('holiday')
      );
    });

    const isFrequentTraveler = ctx.profile?.persona_tag === 'FRAUD' || (ctx.twin?.monthly_surplus || 0) > 25000;

    if (!travelTxn && !isFrequentTraveler) {
      return null;
    }

    const signals = [
      travelTxn ? `Travel merchant booking detected: ${travelTxn.description}` : 'Frequent transit & dining outlays observed',
      `Healthy disposable liquidity reserve (₹${ctx.account?.balance?.toLocaleString('en-IN')})`,
    ];

    return {
      id: `lep_travel_${ctx.customerId}`,
      event_type: 'TRAVEL_AND_VACATION_GOAL',
      category: 'TRAVEL',
      title: 'Travel Goal & Vacation Protection',
      confidence: travelTxn ? 'HIGH' : 'MEDIUM',
      confidence_score: travelTxn ? 88 : 74,
      detected_signals: signals,
      why_detected: 'Travel merchant activities and lifestyle spending patterns show active holiday planning.',
      recommendation: {
        title: 'Bharat Yatra Recurring Travel Deposit & Free Travel Insurance',
        product_type: 'SAVINGS',
        description: 'Auto-save for domestic pilgrimages or vacations with zero-forex markup debit privileges.',
        benefit: 'Complementary ₹25 Lakh accidental travel insurance and airport lounge access',
      },
      action: {
        label: 'Set Travel Savings Goal',
        route: '/recommendations',
        query_prompt: 'How can I set up a dedicated travel savings goal?',
      },
    };
  }

  /**
   * Rule 8: Financial Stress Detection (Anti-Predatory / Relief Priority)
   */
  public static evaluateFinancialStress(ctx: CustomerContextForRules): LifeEventPrediction | null {
    const isStressed =
      ctx.twin?.dont_sell_me_active ||
      ctx.stress?.stress_level === 'HIGH' ||
      (ctx.twin?.savings_growth_rate || 0) <= -30 ||
      (ctx.twin?.emi_to_income_ratio || 0) >= 50;

    if (!isStressed) {
      return null;
    }

    const signals = [
      `Elevated EMI commitment: ${ctx.twin?.emi_to_income_ratio || 60}% of income consumed by loan repayments`,
      `Savings growth rate: ${ctx.twin?.savings_growth_rate || -45}% (Severe contraction alert)`,
      `Low liquid buffer: ₹${ctx.account?.balance?.toLocaleString('en-IN')} remaining in active account`,
      "Don't Sell Me Mode: Active (Hard regulatory block on commercial loan marketing)",
    ];

    return {
      id: `lep_stress_${ctx.customerId}`,
      event_type: 'FINANCIAL_STRESS_RELIEF',
      category: 'STRESS_RELIEF',
      title: 'Financial Cashflow Stress & Debt Restructuring',
      confidence: 'HIGH',
      confidence_score: 96,
      detected_signals: signals,
      why_detected: `High debt burden (${ctx.twin?.emi_to_income_ratio || 60}% EMI ratio) and a ${Math.abs(ctx.twin?.savings_growth_rate || 45)}% drop in savings detected. Commercial loans are prohibited by policy.`,
      recommendation: {
        title: 'Samadhan Debt Restructuring & EMI Grace Program',
        product_type: 'DEBT_RESTRUCTURING',
        description: 'Extend your loan repayment tenure to reduce monthly EMI commitments from ₹24,000 down to ₹13,200 immediately.',
        benefit: 'Up to 45% reduction in monthly EMI outflows without damaging credit rating',
      },
      action: {
        label: 'Apply Samadhan EMI Restructuring',
        route: '/stress-assistance',
        query_prompt: 'How does Samadhan Debt Restructuring help lower my EMI?',
      },
    };
  }
}

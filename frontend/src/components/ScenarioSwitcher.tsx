import React, { useState } from 'react';
import { Users, ChevronDown, Check, Sparkles, Shield, AlertTriangle, Languages, Sliders, ShieldCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const ScenarioSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, switchScenario, loading } = useAuth();
  const { language, setLanguage } = useLanguage();

  const scenarios = [
    {
      id: 'HEALTHY',
      name: 'Customer A: Rahul Verma',
      tag: 'Healthy / Disciplined Saver',
      desc: 'High savings (41%), stable salary, receives Gold SIP investment recommendation.',
      icon: Sparkles,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/30',
    },
    {
      id: 'MODERATE',
      name: 'Customer B: Priya Patel',
      tag: 'Moderate / Growing Buffer',
      desc: 'Moderate savings (18%), steady cashflow, liquid emergency fund recommended.',
      icon: ShieldCheck,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/30',
    },
    {
      id: 'STRESS',
      name: 'Customer C: Amit Sharma',
      tag: "HIGH STRESS / Don't Sell Me Mode",
      desc: 'Savings drop -45%, high EMI (60%), missed payment. Loan cross-sell BLOCKED; Samadhan relief offered.',
      icon: AlertTriangle,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
    },
    {
      id: 'FRAUD',
      name: 'Customer D: Vikram Rao',
      tag: 'Fraud & Anomaly Trigger',
      desc: 'Sudden ₹85,000 transaction at 02:45 AM triggers statistical anomaly flag (z-score: 4.8).',
      icon: Shield,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/30',
    },
    {
      id: 'VERNACULAR',
      name: 'Customer E: Ramesh Patel (ગુજરાતી)',
      tag: 'Vernacular Rural / Dairy Farmer',
      desc: 'Native Gujarati speaker from Anand. Converses with AI in Gujarati about Kisan credit & crop savings.',
      icon: Languages,
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10',
      border: 'border-cyan-500/30',
    },
    {
      id: 'WHATIF',
      name: 'Customer F: Sunita Devi (सुनीता देवी)',
      tag: 'What-If Loan Simulator',
      desc: 'Steady teacher salary evaluating ₹5 Lakh home renovation loan impact on monthly surplus.',
      icon: Sliders,
      color: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      border: 'border-indigo-500/30',
    },
    {
      id: 'ADMIN',
      name: 'Admin: Rajesh Gupta',
      tag: 'Chief Risk & AI Compliance Officer',
      desc: 'Live AI Decision Stream, policy intercept monitor & regulatory audit logs.',
      icon: Users,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/30',
    },
  ];

  const currentScenario = scenarios.find((s) => s.id === user?.persona_tag) || scenarios[0];

  const handleSelect = async (id: string) => {
    setIsOpen(false);
    if (id === 'VERNACULAR') {
      setLanguage('gu');
    }
    await switchScenario(id);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={loading}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 shadow-lg text-xs font-semibold text-slate-200 transition-all hover:border-indigo-500/50"
      >
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span className="text-slate-400 hidden sm:inline">Scenario:</span>
        <span className="font-bold text-white max-w-[160px] truncate">{currentScenario.name}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="px-3 py-2 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Demo Judge Persona Selector</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">1-Click Live Switch</span>
            </div>

            <div className="mt-1 space-y-1 max-h-[75vh] overflow-y-auto pr-1">
              {scenarios.map((s) => {
                const Icon = s.icon;
                const isSelected = user?.persona_tag === s.id;

                return (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    className={`w-full text-left p-3 rounded-xl transition flex items-start gap-3 border ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500/50 shadow-md'
                        : 'hover:bg-slate-800/60 border-transparent'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${s.bg} ${s.color} border ${s.border} shrink-0 mt-0.5`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-white truncate">{s.name}</div>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />}
                      </div>
                      <div className={`text-[11px] font-semibold ${s.color} mt-0.5`}>{s.tag}</div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-tight">{s.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

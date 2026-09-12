import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Cpu,
  Activity,
  Sparkles,
  HeartHandshake,
  ReceiptText,
  Send,
  BotMessageSquare,
  Sliders,
  Landmark,
  UserCheck,
  ShieldAlert,
  Lock,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const navItems = [
    { to: '/', label: t('nav_dashboard'), icon: LayoutDashboard, badge: 'Core' },
    { to: '/twin', label: t('nav_twin'), icon: Cpu, badge: 'Engine 1' },
    { to: '/health', label: t('nav_health'), icon: Activity, badge: 'Score' },
    { to: '/recommendations', label: t('nav_recommendations'), icon: Sparkles, badge: 'Engine 2' },
    { to: '/stress-assistance', label: t('nav_stress_help'), icon: HeartHandshake, badge: 'Guardian', highlight: user?.persona_tag === 'STRESS' },
    { to: '/transactions', label: t('nav_transactions'), icon: ReceiptText },
    { to: '/upi', label: t('nav_upi'), icon: Send, badge: 'Demo' },
    { to: '/assistant', label: t('nav_assistant'), icon: BotMessageSquare, badge: 'Engine 5' },
    { to: '/what-if', label: t('nav_whatif'), icon: Sliders, badge: 'Engine 6' },
    { to: '/loan-journey', label: t('nav_loans'), icon: Landmark },
    { to: '/onboarding', label: t('nav_onboarding'), icon: UserCheck },
    { to: '/fraud-security', label: t('nav_fraud'), icon: ShieldAlert, badge: 'Engine 4', alert: user?.persona_tag === 'FRAUD' },
    { to: '/consent', label: t('nav_consent'), icon: Lock, badge: 'DPDPA' },
  ];

  const adminNavItems = [
    { to: '/admin', label: t('nav_admin'), icon: Layers, badge: 'Policy' },
    { to: '/audit-logs', label: t('nav_audit'), icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)] shadow-xs">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Banking Experience
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                        : item.highlight
                        ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold animate-pulse'
                        : item.alert
                        ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Admin & Compliance Section */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Responsible AI & Compliance
          </div>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-purple-50 text-purple-700 border border-purple-200 font-bold shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-purple-600" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 mt-6 space-y-1">
        <div className="flex items-center gap-1.5 font-bold text-slate-700">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          FinPulse Bank-Grade Core
        </div>
        <div className="leading-tight">DPDPA 2023 & RBI Fair Lending Safeguards Certified</div>
      </div>
    </aside>
  );
};

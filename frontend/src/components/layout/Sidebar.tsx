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
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
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
                        ? 'bg-gradient-to-r from-indigo-600/30 to-indigo-500/10 text-indigo-300 border border-indigo-500/40 shadow-sm'
                        : item.highlight
                        ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30 animate-pulse'
                        : item.alert
                        ? 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-slate-800 text-slate-400 border border-slate-700 shrink-0">
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
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
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
                        ? 'bg-gradient-to-r from-purple-600/30 to-purple-500/10 text-purple-300 border border-purple-500/40'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Icon className="w-4 h-4 shrink-0 text-purple-400" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded font-bold bg-purple-900/30 text-purple-300 border border-purple-700/40 shrink-0">
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
      <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-[10px] text-slate-400 mt-6">
        <div className="font-bold text-slate-300">FinPulse AI Core</div>
        <div>DPDPA 2023 & RBI Fair Lending Safeguards Enabled</div>
      </div>
    </aside>
  );
};

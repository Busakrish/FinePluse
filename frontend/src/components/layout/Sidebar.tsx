import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  LogOut,
  ShieldCheck,
  Building2,
  Eye,
  Compass,
  PieChart,
} from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  // Retail citizen banking navigation items (Only for regular customers)
  const customerNavItems = [
    { to: '/', label: t('nav_dashboard'), icon: LayoutDashboard, badge: 'Core' },
    { to: '/assistant', label: t('nav_assistant'), icon: BotMessageSquare, badge: 'Copilot' },
    { to: '/life-events', label: t('nav_life_events') || 'Life Event Prediction AI', icon: Compass, badge: 'Engine 3' },
    { to: '/spending-coach', label: t('nav_spending_coach') || 'AI Spending Coach', icon: PieChart, badge: 'Coach' },
    { to: '/what-if', label: t('nav_whatif'), icon: Sliders, badge: 'Engine 6' },
    { to: '/fraud-security', label: t('nav_fraud'), icon: ShieldAlert, badge: 'Engine 4', alert: user?.persona_tag === 'FRAUD' },
    { to: '/consent', label: t('nav_consent'), icon: Lock, badge: 'DPDPA' },
  ];

  const customerSecondaryNavItems = [
    { to: '/transactions', label: t('nav_transactions'), icon: ReceiptText },
    { to: '/twin', label: t('nav_twin'), icon: Cpu, badge: 'Engine 1' },
    { to: '/recommendations', label: t('nav_recommendations'), icon: Sparkles, badge: 'Engine 2' },
    { to: '/stress-assistance', label: t('nav_stress_help'), icon: HeartHandshake, badge: 'Guardian', highlight: user?.persona_tag === 'STRESS' },
    { to: '/upi', label: t('nav_upi'), icon: Send, badge: 'Demo' },
  ];

  // Dedicated Admin & Chief Risk Officer navigation items (Strictly separated)
  const adminNavItems = [
    { to: '/admin', label: 'AI Decision Stream', icon: Layers, badge: 'Live Policy' },
    { to: '/audit-logs', label: 'Regulatory Audit Trail', icon: FileSpreadsheet, badge: 'RBI 35' },
    { to: '/fraud-security', label: 'Fraud & Anomaly Shield', icon: ShieldAlert, badge: 'Engine 4' },
    { to: '/consent', label: 'Citizen Consent Monitor', icon: Lock, badge: 'DPDPA 2023' },
  ];

  const adminInspectionItems = [
    { to: '/', label: 'Citizen Passbook Preview', icon: LayoutDashboard },
    { to: '/twin', label: 'Financial Twin Analysis', icon: Cpu },
    { to: '/what-if', label: 'What-If Simulation Sandbox', icon: Sliders },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between p-4 shrink-0 sticky top-[65px] h-[calc(100vh-65px)] overflow-y-auto shadow-xs">
      <div className="space-y-6">
        {isAdmin ? (
          /* ADMIN PORTAL NAVIGATION */
          <>
            <div>
              <div className="flex items-center gap-1.5 px-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
                <span className="text-[11px] font-black text-purple-800 uppercase tracking-wider">
                  {t('sidebar_risk_governance')}
                </span>
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
                            ? 'bg-purple-50 text-purple-800 border border-purple-200 font-bold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-purple-700" />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded font-black bg-purple-100 text-purple-800 border border-purple-200 shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('sidebar_customer_sandboxes')}</span>
              </div>
              <nav className="space-y-1">
                {adminInspectionItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                        <span className="truncate">{item.label}</span>
                      </div>
                    </NavLink>
                  );
                })}
              </nav>
            </div>
          </>
        ) : (
          /* RETAIL CITIZEN BANKING NAVIGATION (Zero Admin Links) */
          <div className="space-y-4">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {t('sidebar_ai_banking')}
              </div>
              <nav className="space-y-1">
                {customerNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-xs font-bold'
                            : item.alert
                            ? 'bg-rose-50 text-rose-800 border border-rose-300 font-bold'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-blue-600" />
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

            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
                {t('sidebar_accounts_services')}
              </div>
              <nav className="space-y-1">
                {customerSecondaryNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 border border-slate-300 font-bold shadow-xs'
                            : item.highlight
                            ? 'bg-amber-50 text-amber-800 border border-amber-300 font-bold animate-pulse'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className="w-4 h-4 shrink-0 text-slate-500" />
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
          </div>
        )}
      </div>

      {/* Footer with Security Status & Prominent Logout */}
      <div className="space-y-3 mt-6 pt-4 border-t border-slate-100">
        <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {isAdmin ? 'CRO Audit Enforced' : 'FinPulse Bank-Grade Core'}
          </div>
          <div className="leading-tight">
            {isAdmin ? 'RBI Master Direction on AI & Algorithmic Safety' : 'DPDPA 2023 & Fair Lending Safeguards Certified'}
          </div>
        </div>

        {/* Secure Log Out Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 text-xs font-bold transition shadow-2xs group"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600 transition" />
          <span>Secure Log Out</span>
        </button>
      </div>
    </aside>
  );
};

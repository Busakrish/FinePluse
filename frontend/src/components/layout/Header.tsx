import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Languages, Bell, User as UserIcon, ShieldAlert, LogOut, ShieldCheck, Lock } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScenarioSwitcher } from '../ScenarioSwitcher';
import { Language } from '../../i18n/translations';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const langOptions: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center w-10 h-10 rounded-xl shadow-md text-white font-black tracking-wider text-xl ${
          isAdmin
            ? 'bg-gradient-to-tr from-purple-700 via-indigo-700 to-purple-900 shadow-purple-700/20'
            : 'bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-600 shadow-blue-700/20'
        }`}>
          FP
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              FINPULSE <span className={isAdmin ? 'text-purple-700' : 'text-blue-700'}>AI</span>
            </h1>
            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
              isAdmin
                ? 'bg-purple-100 text-purple-800 border-purple-300'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}>
              {isAdmin ? 'ADMIN & COMPLIANCE' : 'BHARAT BANKING'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
            {isAdmin ? 'Central Bank Surveillance & Algorithmic Safety Intercept Gateway' : t('brand_tagline')}
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Judge Scenario Switcher */}
        <ScenarioSwitcher />

        {/* Vernacular Language Switcher */}
        <div className="flex items-center bg-slate-100 rounded-xl border border-slate-200 p-1">
          <Languages className="w-3.5 h-3.5 text-blue-600 ml-1.5 mr-1 hidden sm:inline" />
          {langOptions.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === l.code
                  ? 'bg-blue-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* User Pill with Role Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs border ${
            isAdmin
              ? 'bg-purple-100 text-purple-800 border-purple-300'
              : 'bg-blue-100 text-blue-700 border-blue-200'
          }`}>
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 max-w-[120px] truncate">{user?.name || 'User'}</div>
            <div className={`text-[10px] font-semibold ${isAdmin ? 'text-purple-700' : 'text-slate-500'}`}>
              {isAdmin ? 'Chief Risk Officer' : 'Retail Customer'}
            </div>
          </div>
        </div>

        {/* Secure Logout Button */}
        <button
          onClick={handleLogout}
          title="Secure Log Out"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-300 hover:border-rose-300 transition shadow-2xs"
        >
          <LogOut className="w-4 h-4 text-slate-500 group-hover:text-rose-600" />
          <span className="hidden sm:inline">Log Out</span>
        </button>
      </div>
    </header>
  );
};

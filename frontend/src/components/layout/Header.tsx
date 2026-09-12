import React from 'react';
import { Languages, Bell, User as UserIcon, ShieldAlert } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { ScenarioSwitcher } from '../ScenarioSwitcher';
import { Language } from '../../i18n/translations';

export const Header: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();
  const { user } = useAuth();

  const langOptions: { code: Language; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3.5 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 shadow-lg shadow-indigo-500/25">
          <span className="text-xl font-black tracking-wider text-white">FP</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
              FINPULSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">AI</span>
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              BHARAT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">
            {t('brand_tagline')}
          </p>
        </div>
      </div>

      {/* Right Controls: Scenario Switcher + Vernacular Selector + User Info */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Judge Scenario Switcher */}
        <ScenarioSwitcher />

        {/* Vernacular Language Switcher */}
        <div className="flex items-center bg-slate-800/90 rounded-xl border border-slate-700 p-1">
          <Languages className="w-3.5 h-3.5 text-indigo-400 ml-1.5 mr-1 hidden sm:inline" />
          {langOptions.map((l) => (
            <button
              key={l.code}
              onClick={() => setLanguage(l.code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                language === l.code
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {/* User Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center font-bold text-xs border border-indigo-500/30">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-white max-w-[120px] truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-slate-400">{user?.role === 'ADMIN' ? 'Compliance Admin' : 'Verified Bharat KYC'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

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
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 py-3 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Brand / Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-600 shadow-md shadow-blue-700/20 text-white">
          <span className="text-xl font-black tracking-wider">FP</span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              FINPULSE <span className="text-blue-700">AI</span>
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
              BHARAT BANKING
            </span>
          </div>
          <p className="text-[11px] text-slate-500 hidden sm:block font-medium">
            {t('brand_tagline')}
          </p>
        </div>
      </div>

      {/* Right Controls: Scenario Switcher + Vernacular Selector + User Info */}
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

        {/* User Pill */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-900 max-w-[120px] truncate">{user?.name || 'User'}</div>
            <div className="text-[10px] text-slate-500 font-medium">{user?.role === 'ADMIN' ? 'Compliance Admin' : 'Verified Bharat KYC'}</div>
          </div>
        </div>
      </div>
    </header>
  );
};

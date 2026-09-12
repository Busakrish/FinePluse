import React from 'react';
import { ShieldCheck, ShieldAlert, HeartHandshake, Shield, EyeOff } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface GuardianPillProps {
  status: 'RECOMMEND' | 'HELP' | 'WARN' | 'PROTECT' | 'STAY_SILENT' | string;
  className?: string;
}

export const GuardianPill: React.FC<GuardianPillProps> = ({ status, className = '' }) => {
  const { t } = useLanguage();

  switch (status) {
    case 'HELP':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-xs ${className}`}>
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>{t('guardian_help')}</span>
        </div>
      );
    case 'PROTECT':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300 shadow-xs animate-pulse ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t('guardian_protect')}</span>
        </div>
      );
    case 'WARN':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-orange-800 border border-orange-300 shadow-xs ${className}`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{t('guardian_warn')}</span>
        </div>
      );
    case 'STAY_SILENT':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300 shadow-xs ${className}`}>
          <EyeOff className="w-3.5 h-3.5" />
          <span>{t('guardian_silent')}</span>
        </div>
      );
    case 'RECOMMEND':
    default:
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-xs ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('guardian_recommend')}</span>
        </div>
      );
  }
};

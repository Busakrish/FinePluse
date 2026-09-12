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
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 ${className}`}>
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>{t('guardian_help')}</span>
        </div>
      );
    case 'PROTECT':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30 animate-pulse ${className}`}>
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>{t('guardian_protect')}</span>
        </div>
      );
    case 'WARN':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30 ${className}`}>
          <Shield className="w-3.5 h-3.5" />
          <span>{t('guardian_warn')}</span>
        </div>
      );
    case 'STAY_SILENT':
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/40 ${className}`}>
          <EyeOff className="w-3.5 h-3.5" />
          <span>{t('guardian_silent')}</span>
        </div>
      );
    case 'RECOMMEND':
    default:
      return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 ${className}`}>
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{t('guardian_recommend')}</span>
        </div>
      );
  }
};

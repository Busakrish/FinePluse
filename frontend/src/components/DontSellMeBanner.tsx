import React from 'react';
import { ShieldCheck, HeartHandshake, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

interface DontSellMeBannerProps {
  factors?: string[];
}

export const DontSellMeBanner: React.FC<DontSellMeBannerProps> = ({ factors }) => {
  const { t } = useLanguage();

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900/90 to-amber-950/60 border border-amber-500/40 p-5 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase tracking-wide">
                Responsible AI Protection
              </span>
              <h3 className="text-base font-bold text-amber-200">
                {t('dont_sell_me_title')}
              </h3>
            </div>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t('dont_sell_me_desc')}
            </p>
            {factors && factors.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-2 text-xs text-amber-300/80">
                <span className="font-semibold text-slate-400">Detected Signals:</span>
                {factors.slice(0, 2).map((factor, idx) => (
                  <span key={idx} className="bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700">
                    • {factor}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/stress-assistance"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02]"
          >
            <span>{t('apply_restructuring')}</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

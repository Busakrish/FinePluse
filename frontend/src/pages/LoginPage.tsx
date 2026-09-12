import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, switchScenario, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('rahul@finpulse.bharat');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const success = await login(email, password);
    if (success) {
      navigate('/');
    } else {
      setError('Invalid credentials. You can also use the 1-click persona buttons below.');
    }
  };

  const handlePersonaLogin = async (tag: string) => {
    const success = await switchScenario(tag);
    if (success) {
      navigate('/');
    }
  };

  const personas = [
    { tag: 'HEALTHY', name: 'Rahul Verma', role: 'Disciplined Saver (41% Surplus)' },
    { tag: 'MODERATE', name: 'Priya Patel', role: 'Moderate Saver (Surat, Gujarat)' },
    { tag: 'STRESS', name: 'Amit Sharma', role: "HIGH STRESS / Don't Sell Me Mode" },
    { tag: 'FRAUD', name: 'Vikram Rao', role: 'Fraud Anomaly Spike (₹85k)' },
    { tag: 'VERNACULAR', name: 'Ramesh Patel', role: 'Gujarati Farmer (Anand, Gujarat)' },
    { tag: 'WHATIF', name: 'Sunita Devi', role: 'What-If Loan Simulator (Teacher)' },
    { tag: 'ADMIN', name: 'Rajesh Gupta', role: 'Chief Risk & Compliance Officer' },
  ];

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="w-full max-w-xl glass-panel p-8 sm:p-10 rounded-3xl space-y-6 shadow-2xl border-slate-700/80">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 shadow-xl shadow-indigo-500/25">
            <span className="text-2xl font-black text-white">FP</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">FINPULSE AI</h2>
          <p className="text-xs text-indigo-300 font-semibold">{t('brand_tagline')}</p>
        </div>

        {/* 1-Click Judge Persona Fast Login */}
        <div className="space-y-2.5 p-4 rounded-2xl bg-slate-950/60 border border-indigo-500/30">
          <div className="flex items-center justify-between text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5 text-indigo-400">
              <Users className="w-4 h-4" />
              1-Click Fast Persona Switch (For Demo Judges)
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">No Password Required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {personas.map((p) => (
              <button
                key={p.tag}
                type="button"
                onClick={() => handlePersonaLogin(p.tag)}
                className="p-2.5 rounded-xl text-left bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-indigo-500/50 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition">{p.name}</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[170px]">{p.role}</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-lg shadow-indigo-500/25 transition-all"
          >
            {loading ? 'Authenticating...' : 'Sign In with Secure Credentials'}
          </button>
        </form>
      </div>
    </div>
  );
};

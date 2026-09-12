import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, Mail, Sparkles, ArrowRight, ShieldCheck, Users, Building2, CheckCircle2, Shield, ShieldAlert, KeyRound, Copy } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const LoginPage: React.FC = () => {
  const { login, switchScenario, loading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  // 'CUSTOMER' or 'ADMIN' login mode
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');

  // Customer credentials (Starts clean, user must choose or type)
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [error, setError] = useState<string | null>(null);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!custEmail || !custPassword) {
      setError('Please enter your email and password to log in.');
      return;
    }
    const result = await login(custEmail, custPassword);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Invalid credentials. Please verify your email and password.');
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminEmail || !adminPassword) {
      setError('Please enter your official bank email and security token.');
      return;
    }
    const result = await login(adminEmail, adminPassword);
    if (result.success) {
      if (result.user?.role === 'ADMIN') {
        navigate('/admin');
      } else {
        setError('Access Denied: This account does not possess Admin/CRO privileges.');
      }
    } else {
      setError(result.error || 'Invalid administrative credentials.');
    }
  };

  const handlePersonaLogin = async (tag: string, email: string, pass: string) => {
    setError(null);
    if (tag === 'ADMIN') {
      setAdminEmail(email);
      setAdminPassword(pass);
    } else {
      setCustEmail(email);
      setCustPassword(pass);
    }

    const success = await switchScenario(tag);
    if (success) {
      if (tag === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const customerPersonas = [
    {
      tag: 'HEALTHY',
      name: 'Rahul Verma',
      email: 'rahul@finpulse.bharat',
      pass: 'password123',
      role: 'Disciplined Saver (41% Surplus)',
      badge: 'Low Risk',
      location: 'Indore, MP',
    },
    {
      tag: 'MODERATE',
      name: 'Priya Patel',
      email: 'priya@finpulse.bharat',
      pass: 'password123',
      role: 'Moderate Saver (Growing Buffer)',
      badge: 'Medium Risk',
      location: 'Surat, Gujarat',
    },
    {
      tag: 'STRESS',
      name: 'Amit Sharma',
      email: 'amit@finpulse.bharat',
      pass: 'password123',
      role: "High Debt Strain / Don't Sell Me",
      badge: 'Protected',
      location: 'Meerut, UP',
    },
    {
      tag: 'FRAUD',
      name: 'Vikram Rao',
      email: 'vikram@finpulse.bharat',
      pass: 'password123',
      role: 'Outlier Spike Flagged (₹85k)',
      badge: 'Z-Score 4.8σ',
      location: 'Nagpur, MH',
    },
    {
      tag: 'VERNACULAR',
      name: 'Ramesh Patel',
      email: 'ramesh@finpulse.bharat',
      pass: 'password123',
      role: 'Dairy Farmer (Native Gujarati)',
      badge: 'Vernacular',
      location: 'Anand, Gujarat',
    },
    {
      tag: 'WHATIF',
      name: 'Sunita Devi',
      email: 'sunita@finpulse.bharat',
      pass: 'password123',
      role: 'Loan Simulator (Teacher)',
      badge: 'Simulation',
      location: 'Patna, Bihar',
    },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-2xl bg-white border border-slate-200 p-6 sm:p-10 rounded-3xl space-y-6 shadow-sm">
        {/* Institutional Banking Brand Header */}
        <div className="text-center space-y-2">
          <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white shadow-xs font-black tracking-wider text-2xl ${
            activeTab === 'ADMIN'
              ? 'bg-purple-700 shadow-purple-700/20'
              : 'bg-blue-600 shadow-blue-600/20'
          }`}>
            FP
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">FINPULSE BHARAT NETBANKING</h2>
            <p className="text-xs text-blue-700 font-bold mt-0.5">Empathetic, Transparent & Explainable Banking for Millions</p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              RBI Sandbox Compliant
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              DPDPA 2023 Enforced
            </span>
          </div>
        </div>

        {/* Role Separation Tabs: Retail vs Admin */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CUSTOMER');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'CUSTOMER'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Retail NetBanking (6 Users)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ADMIN'
                ? 'bg-purple-700 text-white shadow-xs border border-purple-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <span>Bank Officer / Admin (1 User)</span>
          </button>
        </div>

        {/* TAB 1: RETAIL CUSTOMER LOGIN (6 USERS) */}
        {activeTab === 'CUSTOMER' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Quick 1-Click Persona Directory for Testing & Judges */}
            <div className="space-y-2.5 p-4 rounded-2xl bg-blue-50/50 border border-blue-200">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <Users className="w-4 h-4 text-blue-700" />
                  Registered Citizen Accounts (Click Any to Sign In):
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-200">
                  Password: password123
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {customerPersonas.map((p) => (
                  <button
                    key={p.tag}
                    type="button"
                    onClick={() => handlePersonaLogin(p.tag, p.email, p.pass)}
                    className="p-3 rounded-xl text-left bg-white hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 transition flex items-center justify-between group shadow-2xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">{p.name}</span>
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                          {p.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">{p.role}</div>
                      <div className="text-[10px] text-blue-700 font-mono mt-1 flex items-center gap-1">
                        <span>{p.email}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Standard Retail Customer Credentials Form */}
            <form onSubmit={handleCustomerLogin} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Registered Citizen Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="e.g. rahul@finpulse.bharat"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Enter password (e.g. password123)"
                    value={custPassword}
                    onChange={(e) => setCustPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all"
              >
                {loading ? 'Verifying Credentials...' : 'Sign In to Retail NetBanking'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: BANK OFFICER / ADMIN PORTAL LOGIN (1 USER) */}
        {activeTab === 'ADMIN' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-purple-700" />
                <span>Authorized Regulatory & Compliance Access Only</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-relaxed">
                Administrative portal granting surveillance access to live algorithmic proposals vs. deterministic safety intercepts and RBI regulatory audit trails.
              </p>
            </div>

            {/* Officer Persona Card */}
            <div className="p-4 rounded-2xl bg-white border border-purple-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Official Officer Account:
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  Password: admin123
                </span>
              </div>

              <button
                type="button"
                onClick={() => handlePersonaLogin('ADMIN', 'admin@finpulse.bharat', 'admin123')}
                className="w-full p-3.5 rounded-xl text-left bg-purple-50 hover:bg-purple-100/70 border border-purple-300 transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-black text-purple-900">Rajesh Gupta</div>
                  <div className="text-[11px] text-purple-700 font-medium">Chief Risk & AI Compliance Officer (Mumbai HQ)</div>
                  <div className="text-[10px] text-purple-800 font-mono mt-1">Email: admin@finpulse.bharat</div>
                </div>
                <ArrowRight className="w-5 h-5 text-purple-700 group-hover:translate-x-1 transition shrink-0" />
              </button>
            </div>

            {/* Officer Credentials Form */}
            <form onSubmit={handleAdminLogin} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Bank Personnel Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    placeholder="admin@finpulse.bharat"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-600 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Officer Security Token / Password</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="Enter officer password (admin123)"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-600 transition"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-purple-700 hover:bg-purple-800 text-white shadow-xs transition-all"
              >
                {loading ? 'Authenticating Officer...' : 'Authorize & Enter Risk Portal'}
              </button>
            </form>
          </div>
        )}

        <div className="pt-2 text-center text-[11px] text-slate-500 font-medium">
          Protected by 256-bit TLS encryption • Sovereign citizen data isolated under RBI guidelines
        </div>
      </div>
    </div>
  );
};

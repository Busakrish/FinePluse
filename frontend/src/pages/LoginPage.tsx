import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ShieldCheck, ShieldAlert, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // 'CUSTOMER' or 'ADMIN' login mode
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');

  // Customer credentials
  const [custEmail, setCustEmail] = useState('');
  const [custPassword, setCustPassword] = useState('');
  const [showCustPassword, setShowCustPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Admin credentials
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!custEmail.trim() || !custPassword) {
      setError('Please enter your registered email and password.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(custEmail.trim(), custPassword);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Invalid email or password. Please try again.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!adminEmail.trim() || !adminPassword) {
      setError('Please enter your official bank email and security token.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await login(adminEmail.trim(), adminPassword);
      if (result.success) {
        if (result.user?.role === 'ADMIN') {
          navigate('/admin');
        } else {
          setError('Access Denied: This account does not possess Admin/CRO privileges.');
        }
      } else {
        setError(result.error || 'Invalid administrative credentials.');
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-sm">
        {/* Official Bank Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-emerald-600 text-white shadow-xs font-black tracking-wider text-2xl">
            FP
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              FINPULSE BHARAT NETBANKING
            </h1>
            <p className="text-xs text-blue-700 font-bold mt-0.5">
              Secure Online Banking Portal
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 pt-1">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              256-Bit SSL Encrypted
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-blue-600" />
              RBI Sandbox Certified
            </span>
          </div>
        </div>

        {/* Portal Separation Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
          <button
            type="button"
            onClick={() => {
              setActiveTab('CUSTOMER');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'CUSTOMER'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Retail NetBanking</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('ADMIN');
              setError(null);
            }}
            className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ADMIN'
                ? 'bg-purple-700 text-white shadow-xs border border-purple-700'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-purple-300" />
            <span>Bank Officer / Admin</span>
          </button>
        </div>

        {/* TAB 1: RETAIL CUSTOMER LOGIN */}
        {activeTab === 'CUSTOMER' && (
          <form onSubmit={handleCustomerLogin} className="space-y-4 animate-in fade-in duration-150">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Customer User ID / Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="Enter registered email address"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                NetBanking Password / MPIN
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showCustPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your confidential password"
                  value={custPassword}
                  onChange={(e) => setCustPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-blue-600 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowCustPassword(!showCustPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition"
                  title={showCustPassword ? 'Hide password' : 'Show password'}
                >
                  {showCustPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Remember User ID</span>
              </label>

              <button
                type="button"
                onClick={() => alert('For security, password reset instructions have been forwarded to bank customer support.')}
                className="text-blue-700 hover:text-blue-900 font-bold hover:underline"
              >
                Trouble Logging In?
              </button>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying Credentials...</>
              ) : 'Sign In to Retail NetBanking'}
            </button>
          </form>
        )}

        {/* TAB 2: BANK OFFICER / ADMIN PORTAL LOGIN */}
        {activeTab === 'ADMIN' && (
          <form onSubmit={handleAdminLogin} className="space-y-4 animate-in fade-in duration-150">
            <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-1 text-left">
              <div className="flex items-center gap-1.5 text-purple-950 font-bold text-xs">
                <ShieldAlert className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Authorized Bank Personnel Only</span>
              </div>
              <p className="text-[11px] text-purple-800 leading-tight">
                Subject to central banking surveillance and statutory audit logging under Section 34 of the RBI AI Governance Framework.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Official Bank Personnel Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  autoComplete="username"
                  placeholder="e.g. officer@finpulse.bharat"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-600 transition shadow-2xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Officer Security Token / Password
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showAdminPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter security token"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:border-purple-600 transition shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowAdminPassword(!showAdminPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition"
                  title={showAdminPassword ? 'Hide password' : 'Show password'}
                >
                  {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold leading-relaxed animate-shake">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider bg-purple-700 hover:bg-purple-800 disabled:opacity-60 disabled:cursor-not-allowed text-white shadow-xs transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Authenticating Officer...</>
              ) : 'Authorize & Enter Risk Portal'}
            </button>
          </form>
        )}

        {/* Institutional Banking Security Advice */}
        <div className="pt-3 border-t border-slate-100 space-y-1.5 text-center">
          <div className="text-[11px] text-slate-500 font-medium">
            🔒 Beware of phishing: FinPulse never asks for your NetBanking password, MPIN, or OTP via phone or email.
          </div>
          <div className="text-[10px] text-slate-400">
            Sovereign data hosting strictly within Indian geographical boundaries • ISO 27001 Certified
          </div>
        </div>
      </div>
    </div>
  );
};

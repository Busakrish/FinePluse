import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ShieldCheck, ArrowLeft, Lock, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roleRequired?: 'CUSTOMER' | 'ADMIN';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roleRequired }) => {
  const { user, token, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm text-center space-y-4 max-w-sm w-full">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto border border-blue-200 animate-spin">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">Authenticating Session</h3>
            <p className="text-xs text-slate-500 mt-1">Verifying encrypted 256-bit banking credentials...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Strict role check: If route requires ADMIN and user is not ADMIN, block access
  if (roleRequired === 'ADMIN' && user.role !== 'ADMIN') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white border-2 border-rose-200 p-8 sm:p-10 rounded-3xl shadow-sm text-center space-y-5 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-700 flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-9 h-9" />
          </div>

          <div>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-300 uppercase">
              Security Notice • 403 Forbidden
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-2">Restricted Bank Personnel Portal</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              This area is restricted exclusively to authorized <strong>Chief Risk & Compliance Officers</strong> as per RBI Master Direction on AI Governance.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 text-left">
            <div><strong>Logged in as:</strong> {user.name}</div>
            <div><strong>Assigned Role:</strong> Retail Customer ({user.persona_tag || 'Standard'})</div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Retail NetBanking</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

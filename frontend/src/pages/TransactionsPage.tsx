import React, { useState, useEffect } from 'react';
import { ReceiptText, Search, ArrowDownLeft, ArrowUpRight, AlertTriangle, ShieldCheck, Download } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Transaction } from '../types';

export const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/transactions');
      if (res.data.success) {
        setTransactions(res.data.transactions);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.reference_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || t.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <ReceiptText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                Digital Passbook
              </span>
              <span className="text-xs text-blue-200">NPCI Unified Statement</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Transaction Intelligence Ledger</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 leading-relaxed">
              Unified banking passbook tracking UPI payments, IMPS, salary credits, and loan repayments with real-time AI behavioral classification and statistical anomaly flags.
            </p>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search merchant, description, or reference ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 transition"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium text-xs focus:outline-none focus:bg-white focus:border-blue-600 shrink-0 w-full sm:w-auto"
        >
          <option value="ALL">All Categories</option>
          <option value="Salary">Salary / Income</option>
          <option value="EMI">EMI & Loans</option>
          <option value="Groceries">Groceries</option>
          <option value="Agriculture">Agriculture / Farming</option>
          <option value="Utilities">Utilities & Bills</option>
          <option value="Shopping">Shopping & Electronics</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/80 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4">Transaction / Merchant</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Method & Ref</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-500 font-medium">
                    No transactions match your search filter.
                  </td>
                </tr>
              ) : (
                filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shrink-0 ${t.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                          {t.type === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{t.description}</span>
                            {t.is_anomaly && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-rose-100 text-rose-800 border border-rose-300">
                                ANOMALY
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">{t.merchant_name || 'Direct Transfer'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono text-[10px] text-slate-600 font-semibold">{t.reference_id}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{t.payment_method}</div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium whitespace-nowrap">
                      {new Date(t.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-black text-sm whitespace-nowrap ${t.type === 'CREDIT' ? 'text-emerald-700' : 'text-slate-900'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString('en-IN')}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                        t.status === 'COMPLETED'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : t.status === 'FLAGGED'
                          ? 'bg-rose-50 text-rose-800 border border-rose-300 animate-pulse'
                          : 'bg-amber-50 text-amber-800 border border-amber-300'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

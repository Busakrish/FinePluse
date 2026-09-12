import React, { useState } from 'react';
import { Send, QrCode, ArrowDownLeft, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, Smartphone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export const SimulatedUpiPage: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'SEND' | 'SCAN' | 'REQUEST'>('SEND');
  const [recipientUpi, setRecipientUpi] = useState('shopkeeper@bharatpay');
  const [recipientName, setRecipientName] = useState('Anand Grocery Store');
  const [amount, setAmount] = useState('1500');
  const [category, setCategory] = useState('Groceries');
  const [notes, setNotes] = useState('Weekly Provision Purchase');
  const [loading, setLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setPaymentResult(null);

    try {
      const res = await api.post('/payments/simulate', {
        recipientUpiId: recipientUpi,
        recipientName: recipientName,
        amount: Number(amount),
        category,
        notes,
      });

      if (res.data.success) {
        setPaymentResult(res.data);
        if (!res.data.fraud_evaluation.is_anomaly) {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 },
          });
        }
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || 'Payment simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  const quickPresets = [
    { label: '₹500 Groceries', amount: '500', name: 'Sharma Kirana', upi: 'sharma.kirana@bharatpay', cat: 'Groceries' },
    { label: '₹1,500 Agri Seeds', amount: '1500', name: 'Kisan Seva Kendra', upi: 'kisan.anand@bharatpay', cat: 'Agriculture' },
    { label: '₹85,000 Electronics Spike (Triggers Anomaly Demo)', amount: '85000', name: 'Cyber Gadgets Hub 247', upi: 'cyber.unknown@bharatpay', cat: 'Shopping' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 text-white p-6 sm:p-8 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-white/20 text-white backdrop-blur-xs">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white uppercase tracking-wider backdrop-blur-xs">
                UPI 2.0 Payment Gateway
              </span>
              <span className="text-xs text-blue-200">Live AI Stream Demonstration</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">Simulated Bharat UPI Payment</h2>
            <p className="text-xs sm:text-sm text-blue-100 mt-0.5 leading-relaxed">
              Experience how every UPI transaction immediately updates your AI Financial Twin cashflow metrics and triggers real-time statistical fraud checks.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xs">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 pb-3 gap-3">
          <button
            onClick={() => setActiveTab('SEND')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SEND'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Send Money</span>
          </button>
          <button
            onClick={() => setActiveTab('SCAN')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SCAN'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & Pay (Bharat QR)</span>
          </button>
          <button
            onClick={() => setActiveTab('REQUEST')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'REQUEST'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Receive / Request UPI</span>
          </button>
        </div>

        {/* Quick Presets for Demo */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Demo Quick-Fill Scenarios (1-Click Test)</div>
          <div className="flex flex-wrap gap-2">
            {quickPresets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAmount(p.amount);
                  setRecipientName(p.name);
                  setRecipientUpi(p.upi);
                  setCategory(p.cat);
                  setNotes(`Payment to ${p.name}`);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white hover:bg-blue-50 text-blue-700 border border-slate-200 shadow-xs transition"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: Send Money Form */}
        {activeTab === 'SEND' && (
          <form onSubmit={handleSendPayment} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient UPI ID or VPA</label>
                <input
                  type="text"
                  value={recipientUpi}
                  onChange={(e) => setRecipientUpi(e.target.value)}
                  required
                  placeholder="name@upi or phone number"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 font-mono font-medium transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recipient Name</label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  required
                  placeholder="Merchant or Contact Name"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 font-medium transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  min="1"
                  placeholder="e.g. 1500"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-base font-black focus:outline-none focus:bg-white focus:border-blue-600 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:bg-white focus:border-blue-600 transition"
                >
                  <option value="Groceries">Groceries & Daily Essentials</option>
                  <option value="Agriculture">Agriculture & Farming Input</option>
                  <option value="Utilities">Utilities & Bills</option>
                  <option value="Healthcare">Healthcare & Medicine</option>
                  <option value="Shopping">Shopping & Electronics</option>
                  <option value="Transfer">Peer-to-Peer Transfer</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Notes / Purpose</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional remarks"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:bg-white focus:border-blue-600 transition"
              />
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider bg-blue-700 hover:bg-blue-800 text-white shadow-xs transition-all hover:scale-[1.01]"
            >
              {loading ? 'Simulating UPI Transaction...' : `Simulate ₹${Number(amount || 0).toLocaleString('en-IN')} UPI Payment`}
            </button>
          </form>
        )}

        {/* Tab 2: Scan & Pay Bharat QR */}
        {activeTab === 'SCAN' && (
          <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center">
            <div className="w-48 h-48 rounded-2xl bg-white p-4 shadow-sm flex items-center justify-center border-4 border-blue-600">
              <QrCode className="w-36 h-36 text-slate-900" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Bharat QR Interoperable Terminal</h4>
              <p className="text-xs text-slate-500 font-medium">Point phone camera to trigger immediate simulated checkout</p>
            </div>
            <button
              onClick={() => {
                setActiveTab('SEND');
                setRecipientName('Bharat Supermarket Terminal #42');
                setRecipientUpi('pos.terminal42@bharatpay');
                setAmount('2400');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white transition shadow-xs"
            >
              Simulate Instant QR Scan
            </button>
          </div>
        )}

        {/* Tab 3: Request Money */}
        {activeTab === 'REQUEST' && (
          <div className="space-y-4 p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
            <Smartphone className="w-10 h-10 text-blue-700 mx-auto" />
            <h4 className="text-sm font-bold text-slate-900">Your BharatPay UPI ID</h4>
            <div className="text-base font-mono font-bold text-blue-800 bg-white px-4 py-2 rounded-xl inline-block border border-slate-200 shadow-xs">
              {user?.customer_id ? `${user.name.toLowerCase().replace(/\s+/g, '')}@bharatpay` : 'customer@bharatpay'}
            </div>
            <p className="text-xs text-slate-500 font-medium">Share this ID to receive instant direct credits with 0% gateway charges.</p>
          </div>
        )}

        {/* Payment Success / Anomaly Result Card */}
        {paymentResult && (
          <div className={`p-6 rounded-2xl border space-y-4 animate-in slide-in-from-bottom-2 ${
            paymentResult.fraud_evaluation.is_anomaly
              ? 'bg-rose-50 border-rose-300'
              : 'bg-emerald-50 border-emerald-300'
          }`}>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${paymentResult.fraud_evaluation.is_anomaly ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  {paymentResult.fraud_evaluation.is_anomaly ? <AlertTriangle className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    {paymentResult.fraud_evaluation.is_anomaly ? 'High-Risk Anomaly Flagged (Engine 4)' : 'Simulated Payment Successful!'}
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">
                    Ref ID: <span className="font-mono text-blue-700 font-bold">{paymentResult.transaction.reference_id}</span>
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-900 shadow-xs">
                New Balance: ₹{paymentResult.updated_balance.toLocaleString('en-IN')}
              </span>
            </div>

            {/* Dynamic AI Engine Lifecycle Update Notice */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1.5 text-xs shadow-xs">
              <div className="font-bold text-blue-800 flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                AI Financial Twin Dynamic Re-computation Complete
              </div>
              <p className="text-slate-600">
                Monthly spending and cashflow metrics updated in real-time. Financial Health Score is now{' '}
                <strong className="text-slate-900 font-bold">{paymentResult.updated_twin.financial_health_score}/100</strong> ({paymentResult.updated_twin.financial_health_tier}).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

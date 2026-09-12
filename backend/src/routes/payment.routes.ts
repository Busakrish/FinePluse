import { Router, Response } from 'express';
import { db } from '../db/database.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { FraudEngine } from '../engines/fraud.js';
import { FinancialTwinManager } from '../twin/twinManager.js';

const router = Router();

// POST /api/payments/simulate (Simulated UPI Payment Engine)
router.post('/simulate', authenticate, (req: AuthenticatedRequest, res: Response): any => {
  const customerId = req.user?.customerId;
  if (!customerId) {
    return res.status(400).json({ success: false, error: 'No customer profile found.' });
  }

  const {
    recipientUpiId,
    recipientName,
    amount,
    category,
    paymentMethod = 'UPI',
    notes = 'Simulated UPI Transfer',
  } = req.body;

  const numAmount = Number(amount);
  if (!numAmount || numAmount <= 0) {
    return res.status(400).json({ success: false, error: 'Valid payment amount is required.' });
  }

  const account = db.findOne('accounts', (a) => a.customer_id === customerId);
  if (!account) {
    return res.status(404).json({ success: false, error: 'Source account not found.' });
  }

  if (account.balance < numAmount) {
    return res.status(400).json({
      success: false,
      error: `Insufficient balance (Available: ₹${account.balance.toLocaleString('en-IN')}, Requested: ₹${numAmount.toLocaleString('en-IN')}).`,
    });
  }

  // 1. Run Fraud / Anomaly Engine on the proposed payment
  const currentHour = new Date().getHours();
  const fraudEval = FraudEngine.evaluateTransaction(customerId, numAmount, recipientName || recipientUpiId, currentHour);

  // Deduct source account balance
  const updatedBalance = Number((account.balance - numAmount).toFixed(2));
  db.update('accounts', account.id, { balance: updatedBalance });

  // 2. Create Transaction Record
  const newTx = {
    id: `tx_sim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    account_id: account.id,
    customer_id: customerId,
    amount: numAmount,
    type: 'DEBIT' as const,
    category: category || 'Transfer',
    description: `${notes} to ${recipientName || recipientUpiId || 'Contact'}`,
    merchant_name: recipientName || recipientUpiId || 'Simulated Recipient',
    reference_id: `UPI/SIM/${Date.now().toString().slice(-8)}`,
    payment_method: paymentMethod as any,
    status: fraudEval.is_anomaly ? ('FLAGGED' as const) : ('COMPLETED' as const),
    is_anomaly: fraudEval.is_anomaly,
    created_at: new Date().toISOString(),
  };

  db.insert('transactions', newTx);

  // If anomaly flagged, insert a Fraud Alert
  if (fraudEval.is_anomaly) {
    const newFraudAlert = {
      id: `frd_sim_${Date.now()}`,
      customer_id: customerId,
      transaction_id: newTx.id,
      amount: numAmount,
      risk_level: fraudEval.risk_level,
      trigger_reason: fraudEval.trigger_reason,
      z_score: fraudEval.z_score,
      anomaly_factors: fraudEval.anomaly_factors,
      status: 'PENDING_REVIEW' as const,
      created_at: new Date().toISOString(),
    };
    db.insert('fraud_alerts', newFraudAlert);

    // Audit log
    db.logAudit({
      customer_id: customerId,
      event_type: 'FRAUD_FLAG',
      ai_engine: 'ENGINE_4_FRAUD',
      input_summary: { amount: numAmount, recipient: recipientName },
      engine_output: fraudEval,
      policy_decision: 'FLAGGED',
      final_action_taken: 'Created real-time fraud alert & notified user.',
    });
  }

  // 3. Dynamic Lifecycle Update: Recompute AI Financial Twin
  const updatedTwin = FinancialTwinManager.refreshTwin(customerId);

  // Log simulated payment audit
  db.logAudit({
    customer_id: customerId,
    event_type: 'SIMULATED_PAYMENT',
    ai_engine: 'SAFETY_GATEWAY',
    input_summary: { amount: numAmount, recipientUpiId, category },
    engine_output: { tx_id: newTx.id, new_balance: updatedBalance, fraud_flag: fraudEval.is_anomaly },
    policy_decision: 'ALLOWED',
    final_action_taken: 'Completed simulated transaction & refreshed Financial Twin in real-time.',
  });

  return res.json({
    success: true,
    is_simulated: true,
    message: 'Simulated UPI payment processed successfully.',
    transaction: newTx,
    fraud_evaluation: fraudEval,
    updated_balance: updatedBalance,
    updated_twin: updatedTwin,
  });
});

export default router;

import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import { db } from './db/database.js';
import { seedDatabase } from './db/seed.js';

import authRoutes from './routes/auth.routes.js';
import customerRoutes from './routes/customer.routes.js';
import transactionRoutes from './routes/transactions.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import aiRoutes from './routes/ai.routes.js';
import chatRoutes from './routes/chat.routes.js';
import whatifRoutes from './routes/whatif.routes.js';
import loanRoutes from './routes/loan.routes.js';
import consentRoutes from './routes/consent.routes.js';
import adminRoutes from './routes/admin.routes.js';
import lifeEventsRoutes from './routes/lifeEvents.routes.js';
import spendingRoutes from './routes/spending.routes.js';

const app = express();

// Security & Parsing Middleware
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'HEALTHY',
    service: 'FINPULSE AI Backend for Bharat',
    version: '1.0.0',
    demo_ai_mode: config.demoAiMode,
    timestamp: new Date().toISOString(),
  });
});

// API Routes Mounting
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/what-if', whatifRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/consents', consentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/life-events', lifeEventsRoutes);
app.use('/api/spending', spendingRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred in FinPulse AI service.',
    message: config.nodeEnv === 'development' ? err.message : undefined,
  });
});

// Auto-seed if database is unseeded
const existingUsers = db.getTable('users');
if (!existingUsers || existingUsers.length === 0) {
  console.log('Database empty, initializing demo seed data...');
  seedDatabase();
}

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 FINPULSE AI Backend Running on port ${config.port}`);
  console.log(`🇮🇳 AI-Powered Hyper-Personalized Banking for Bharat`);
  console.log(`⚡ Demo AI Fallback Mode: ${config.demoAiMode ? 'ACTIVE' : 'INACTIVE'}`);
  console.log(`====================================================`);
});

export default app;

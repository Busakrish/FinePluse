import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db } from '../db/database.js';
import { User, CustomerProfile } from '../db/types.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN';
    customerId?: string;
  };
}

export function generateToken(user: User, customerId?: string): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      customerId,
    },
    config.jwtSecret,
    { expiresIn: '7d' }
  );
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Unauthorized: Authentication token is missing.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ success: false, error: 'Unauthorized: Token is invalid or expired.' });
    return;
  }
}

export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json({ success: false, error: 'Forbidden: Admin privileges required.' });
    return;
  }
  next();
}

/**
 * Enforces Customer Data Isolation (Test 5 in Section 45)
 */
export function requireCustomerIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  const requestedCustomerId = req.params.customerId || req.query.customerId || req.body.customerId;
  if (requestedCustomerId && req.user.customerId && requestedCustomerId !== req.user.customerId) {
    res.status(403).json({
      success: false,
      error: 'Access Denied: You cannot access or modify another customer\'s financial data.',
    });
    return;
  }

  next();
}

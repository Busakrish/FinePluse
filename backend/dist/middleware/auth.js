import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
export function generateToken(user, customerId) {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        customerId,
    }, config.jwtSecret, { expiresIn: '7d' });
}
export function authenticate(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ success: false, error: 'Unauthorized: Authentication token is missing.' });
        return;
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, config.jwtSecret);
        req.user = decoded;
        next();
    }
    catch (err) {
        res.status(401).json({ success: false, error: 'Unauthorized: Token is invalid or expired.' });
        return;
    }
}
export function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({ success: false, error: 'Forbidden: Admin privileges required.' });
        return;
    }
    next();
}
/**
 * Enforces Customer Data Isolation (Test 5 in Section 45)
 */
export function requireCustomerIsolation(req, res, next) {
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

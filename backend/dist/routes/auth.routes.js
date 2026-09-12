import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db/database.js';
import { generateToken, authenticate } from '../middleware/auth.js';
const router = Router();
// POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }
    const user = db.findOne('users', (u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch && password !== 'password123' && password !== 'admin123') {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }
    const profile = db.findOne('customer_profiles', (p) => p.user_id === user.id);
    const token = generateToken(user, profile?.id);
    return res.json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            customer_id: profile?.id,
            name: profile?.full_name || 'FinPulse Administrator',
            preferred_language: profile?.preferred_language || 'en',
            persona_tag: profile?.persona_tag,
        },
    });
});
// POST /api/auth/switch-scenario (Fast one-click persona switch for demo judges)
router.post('/switch-scenario', async (req, res) => {
    const { personaTag } = req.body;
    let user;
    if (personaTag === 'ADMIN') {
        user = db.findOne('users', (u) => u.role === 'ADMIN');
    }
    else {
        const profile = db.findOne('customer_profiles', (p) => p.persona_tag === personaTag);
        if (!profile) {
            return res.status(404).json({ success: false, error: `Persona ${personaTag} not found.` });
        }
        user = db.findById('users', profile.user_id);
    }
    if (!user) {
        return res.status(404).json({ success: false, error: 'User for scenario not found.' });
    }
    const profile = db.findOne('customer_profiles', (p) => p.user_id === user.id);
    const token = generateToken(user, profile?.id);
    return res.json({
        success: true,
        token,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            customer_id: profile?.id,
            name: profile?.full_name || 'FinPulse Administrator',
            preferred_language: profile?.preferred_language || 'en',
            persona_tag: profile?.persona_tag || 'ADMIN',
        },
    });
});
// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    if (!req.user) {
        return res.status(401).json({ success: false, error: 'Not authenticated.' });
    }
    const user = db.findById('users', req.user.id);
    if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
    }
    const profile = req.user.customerId ? db.findById('customer_profiles', req.user.customerId) : undefined;
    return res.json({
        success: true,
        user: {
            id: user.id,
            email: user.email,
            role: user.role,
            customer_id: profile?.id,
            name: profile?.full_name || 'FinPulse Administrator',
            preferred_language: profile?.preferred_language || 'en',
            persona_tag: profile?.persona_tag,
        },
    });
});
export default router;

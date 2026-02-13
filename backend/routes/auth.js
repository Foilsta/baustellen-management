import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { Op } from 'sequelize';
import { User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// Login
// DEBUG: Check users
router.get('/debug/users', async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: ['id', 'username', 'email', 'role'] // No passwords
        });
        res.json({
            count: users.length,
            users,
            message: users.length === 0 ? 'NO USERS FOUND' : 'Users exist'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/login', [
    body('usernameOrEmail').notEmpty().withMessage('Benutzername oder E-Mail erforderlich'),
    body('password').notEmpty().withMessage('Passwort erforderlich'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { usernameOrEmail, password } = req.body;

        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail },
                ],
            },
        });

        if (!user) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        const isValidPassword = await user.checkPassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Ungültige Anmeldedaten' });
        }

        const token = jwt.sign(
            { userId: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                profileImage: user.profileImage,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Register (Admin only)
router.post('/register', authenticate, requireAdmin, [
    body('username').isLength({ min: 3, max: 50 }).withMessage('Benutzername muss 3-50 Zeichen lang sein'),
    body('email').isEmail().withMessage('Gültige E-Mail erforderlich'),
    body('password').isLength({ min: 6 }).withMessage('Passwort muss mindestens 6 Zeichen lang sein'),
    body('role').isIn(['admin', 'helper']).withMessage('Ungültige Rolle'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { username, email, password, role } = req.body;

        const user = await User.create({
            username,
            email,
            password,
            role,
        });

        await logActivity(req.user.id, 'user', user.id, 'created');

        res.status(201).json({ user });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
        }
        console.error('Register error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Get current user
router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

export default router;

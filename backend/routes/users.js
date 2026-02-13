import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { body, validationResult } from 'express-validator';
import { User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for profile image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'profiles');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + req.user.id + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Nur Bilddateien sind erlaubt!'));
        }
    }
});

// Profile image upload (accessible to all authenticated users)
router.post('/profile-image', authenticate, upload.single('profileImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Kein Bild hochgeladen' });
        }

        const user = await User.findByPk(req.user.id);

        // Delete old profile image if exists
        if (user.profileImage) {
            const oldImagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profileImage);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }

        user.profileImage = req.file.filename;
        await user.save();

        await logActivity(req.user.id, 'user', user.id, 'updated', { profileImage: user.profileImage });

        res.json({ profileImage: user.profileImage, user });
    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ error: 'Fehler beim Hochladen des Profilbilds' });
    }
});

// Get all users (admin or authenticated for own listing)
router.get('/', authenticate, async (req, res) => {
    try {
        const users = await User.findAll({
            order: [['createdAt', 'DESC']],
        });
        res.json({ users });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Create user (admin only)
router.post('/', authenticate, requireAdmin, [
    body('username').isLength({ min: 3, max: 50 }),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['admin', 'helper']),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.create(req.body);
        await logActivity(req.user.id, 'user', user.id, 'created');
        res.status(201).json({ user });
    } catch (error) {
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(400).json({ error: 'Benutzername oder E-Mail bereits vergeben' });
        }
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Update user (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        const oldData = { ...user.toJSON() };
        const { username, email, role, password } = req.body;

        if (username) user.username = username;
        if (email) user.email = email;
        if (role) user.role = role;
        if (password) user.password = password;

        await user.save();

        await logActivity(req.user.id, 'user', user.id, 'updated', {
            old: oldData,
            new: user.toJSON(),
        });

        res.json({ user });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Delete user (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
    try {
        // Prevent deleting yourself
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ error: 'Sie können sich nicht selbst löschen' });
        }

        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        // Delete profile image if exists
        if (user.profileImage) {
            const imagePath = path.join(__dirname, '..', 'uploads', 'profiles', user.profileImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await logActivity(req.user.id, 'user', user.id, 'deleted');
        await user.destroy();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

export default router;

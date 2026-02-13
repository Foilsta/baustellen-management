import express from 'express';
import { ActivityLog, User } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get activity logs
router.get('/', async (req, res) => {
    try {
        const { entityType, entityId } = req.query;
        const where = {};

        if (entityType) {
            where.entityType = entityType;
        }
        if (entityId) {
            where.entityId = entityId;
        }

        const activities = await ActivityLog.findAll({
            where,
            include: [
                { model: User, as: 'user', attributes: ['id', 'username'] },
            ],
            order: [['createdAt', 'DESC']],
            limit: 100,
        });

        res.json({ activities });
    } catch (error) {
        console.error('Get activities error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

export default router;

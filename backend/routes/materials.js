import express from 'express';
import { body, validationResult } from 'express-validator';
import { Material, User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all materials
router.get('/', async (req, res) => {
    try {
        const { status } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        const materials = await Material.findAll({
            where,
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({ materials });
    } catch (error) {
        console.error('Get materials error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Get single material with activity log
router.get('/:id', async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
            ],
        });

        if (!material) {
            return res.status(404).json({ error: 'Material nicht gefunden' });
        }

        // Get activity log
        const { ActivityLog } = await import('../models/index.js');
        const activityLog = await ActivityLog.findAll({
            where: {
                entityType: 'material',
                entityId: material.id,
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'username'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({ material, activityLog });
    } catch (error) {
        console.error('Get material error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Create material
router.post('/', [
    body('name').notEmpty().withMessage('Name erforderlich'),
    body('quantity').isFloat({ min: 0 }).withMessage('Gültige Menge erforderlich'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { name, quantity, unit, notes } = req.body;

        const material = await Material.create({
            name,
            quantity,
            unit: unit || 'Stück',
            notes,
            createdById: req.user.id,
        });

        await logActivity(req.user.id, 'material', material.id, 'created');

        const createdMaterial = await Material.findByPk(material.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
            ],
        });

        res.status(201).json({ material: createdMaterial });
    } catch (error) {
        console.error('Create material error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Update material
router.put('/:id', async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) {
            return res.status(404).json({ error: 'Material nicht gefunden' });
        }

        const oldData = { ...material.toJSON() };
        const { name, quantity, unit, notes, status } = req.body;

        if (name !== undefined) material.name = name;
        if (quantity !== undefined) material.quantity = quantity;
        if (unit !== undefined) material.unit = unit;
        if (notes !== undefined) material.notes = notes;
        if (status !== undefined) material.status = status;

        await material.save();

        await logActivity(req.user.id, 'material', material.id, 'updated', {
            old: oldData,
            new: material.toJSON(),
        });

        const updatedMaterial = await Material.findByPk(material.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
            ],
        });

        res.json({ material: updatedMaterial });
    } catch (error) {
        console.error('Update material error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Delete material (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const material = await Material.findByPk(req.params.id);
        if (!material) {
            return res.status(404).json({ error: 'Material nicht gefunden' });
        }

        await logActivity(req.user.id, 'material', material.id, 'deleted');
        await material.destroy();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete material error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

export default router;

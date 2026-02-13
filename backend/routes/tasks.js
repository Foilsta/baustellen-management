import express from 'express';
import { body, validationResult } from 'express-validator';
import { Task, User } from '../models/index.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { logActivity } from '../middleware/activityLogger.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const { status, assigned_to } = req.query;
        const where = {};

        if (status) {
            where.status = status;
        }

        if (assigned_to === 'me') {
            where.assignedToId = req.user.id;
        } else if (assigned_to) {
            where.assignedToId = assigned_to;
        }

        const tasks = await Task.findAll({
            where,
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'username'] },
                { model: User, as: 'completedBy', attributes: ['id', 'username'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({ tasks });
    } catch (error) {
        console.error('Get tasks error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Get single task with activity log
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'username'] },
                { model: User, as: 'completedBy', attributes: ['id', 'username'] },
            ],
        });

        if (!task) {
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
        }

        // Get activity log for this task
        const { ActivityLog } = await import('../models/index.js');
        const activityLog = await ActivityLog.findAll({
            where: {
                entityType: 'task',
                entityId: task.id,
            },
            include: [
                { model: User, as: 'user', attributes: ['id', 'username'] },
            ],
            order: [['createdAt', 'DESC']],
        });

        res.json({ task, activityLog });
    } catch (error) {
        console.error('Get task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Create task
router.post('/', [
    body('title').notEmpty().withMessage('Titel erforderlich'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { title, description, dueDate, assignedToId } = req.body;

        const task = await Task.create({
            title,
            description,
            dueDate,
            assignedToId: assignedToId || null,
            createdById: req.user.id,
        });

        await logActivity(req.user.id, 'task', task.id, 'created');

        const createdTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
            ],
        });

        res.status(201).json({ task: createdTask });
    } catch (error) {
        console.error('Create task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Update task
router.put('/:id', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
        }

        const oldData = { ...task.toJSON() };
        const { title, description, status, dueDate, assignedToId } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) {
            task.status = status;
            if (status === 'completed') {
                task.completedById = req.user.id;
                task.completedAt = new Date();
            }
        }
        if (dueDate !== undefined) task.dueDate = dueDate;
        if (assignedToId !== undefined) task.assignedToId = assignedToId || null;

        await task.save();

        await logActivity(req.user.id, 'task', task.id, 'updated', {
            old: oldData,
            new: task.toJSON(),
        });

        const updatedTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'username'] },
                { model: User, as: 'completedBy', attributes: ['id', 'username'] },
            ],
        });

        res.json({ task: updatedTask });
    } catch (error) {
        console.error('Update task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Delete task (Admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
        }

        await logActivity(req.user.id, 'task', task.id, 'deleted');
        await task.destroy();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Assign task to user (Admin only)
router.post('/:id/assign', requireAdmin, [
    body('assignedToId').isInt().withMessage('Gültige Benutzer-ID erforderlich'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
        }

        const user = await User.findByPk(req.body.assignedToId);
        if (!user) {
            return res.status(404).json({ error: 'Benutzer nicht gefunden' });
        }

        const oldAssignedToId = task.assignedToId;
        task.assignedToId = req.body.assignedToId;
        await task.save();

        await logActivity(req.user.id, 'task', task.id, 'assigned', {
            old: { assignedToId: oldAssignedToId },
            new: { assignedToId: task.assignedToId },
        });

        const updatedTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'username'] },
                { model: User, as: 'completedBy', attributes: ['id', 'username'] },
            ],
        });

        res.json({ task: updatedTask });
    } catch (error) {
        console.error('Assign task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Take task (set status to in_progress and assign to self)
router.post('/:id/take', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
        }

        const oldData = { status: task.status, assignedToId: task.assignedToId };
        task.status = 'in_progress';
        task.assignedToId = req.user.id;
        await task.save();

        await logActivity(req.user.id, 'task', task.id, 'status_changed', {
            old: oldData,
            new: { status: task.status, assignedToId: task.assignedToId },
        });

        const updatedTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'username'] },
                { model: User, as: 'completedBy', attributes: ['id', 'username'] },
            ],
        });

        res.json({ task: updatedTask });
    } catch (error) {
        console.error('Take task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

// Complete task
router.post('/:id/complete', async (req, res) => {
    try {
        const task = await Task.findByPk(req.params.id);
        if (!task) {
            return res.status(404).json({ error: 'Aufgabe nicht gefunden' });
        }

        const oldStatus = task.status;
        task.status = 'completed';
        task.completedById = req.user.id;
        task.completedAt = new Date();
        await task.save();

        await logActivity(req.user.id, 'task', task.id, 'status_changed', {
            old: { status: oldStatus },
            new: { status: 'completed' },
        });

        const updatedTask = await Task.findByPk(task.id, {
            include: [
                { model: User, as: 'createdBy', attributes: ['id', 'username', 'profileImage'] },
                { model: User, as: 'assignedTo', attributes: ['id', 'username', 'profileImage'] },
                { model: User, as: 'completedBy', attributes: ['id', 'username', 'profileImage'] },
            ],
        });

        res.json({ task: updatedTask });
    } catch (error) {
        console.error('Complete task error:', error);
        res.status(500).json({ error: 'Serverfehler' });
    }
});

export default router;

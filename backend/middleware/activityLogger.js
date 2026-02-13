import { ActivityLog } from '../models/index.js';

export const logActivity = async (userId, entityType, entityId, action, changes = null) => {
    try {
        await ActivityLog.create({
            userId,
            entityType,
            entityId,
            action,
            changes,
        });
    } catch (error) {
        console.error('Activity logging error:', error);
        // Don't throw - logging shouldn't break the main operation
    }
};

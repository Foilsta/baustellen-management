import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const ActivityLog = sequelize.define('ActivityLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        entityType: {
            type: DataTypes.ENUM('user', 'task', 'material'),
            allowNull: false,
        },
        entityId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        action: {
            type: DataTypes.ENUM('created', 'updated', 'deleted', 'status_changed', 'assigned'),
            allowNull: false,
        },
        changes: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        updatedAt: false, // Activity logs don't get updated
    });

    return ActivityLog;
};

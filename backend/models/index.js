import sequelize from '../config/database.js';
import UserModel from './User.js';
import TaskModel from './Task.js';
import MaterialModel from './Material.js';
import ActivityLogModel from './ActivityLog.js';

// Initialize models
const User = UserModel(sequelize);
const Task = TaskModel(sequelize);
const Material = MaterialModel(sequelize);
const ActivityLog = ActivityLogModel(sequelize);

// Define associations

// User creates Tasks
User.hasMany(Task, {
    foreignKey: { name: 'createdById', allowNull: false },
    as: 'createdTasks',
});
Task.belongsTo(User, {
    foreignKey: 'createdById',
    as: 'createdBy',
});

// User assigned to Tasks
User.hasMany(Task, {
    foreignKey: { name: 'assignedToId', allowNull: true },
    as: 'assignedTasks',
});
Task.belongsTo(User, {
    foreignKey: 'assignedToId',
    as: 'assignedTo',
});

// User completes Tasks
User.hasMany(Task, {
    foreignKey: { name: 'completedById', allowNull: true },
    as: 'completedTasks',
});
Task.belongsTo(User, {
    foreignKey: 'completedById',
    as: 'completedBy',
});

// User creates Materials
User.hasMany(Material, {
    foreignKey: { name: 'createdById', allowNull: false },
    as: 'createdMaterials',
});
Material.belongsTo(User, {
    foreignKey: 'createdById',
    as: 'createdBy',
});

// ActivityLog associations
User.hasMany(ActivityLog, {
    foreignKey: { name: 'userId', allowNull: false },
    as: 'activities',
});
ActivityLog.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
});

export { sequelize, User, Task, Material, ActivityLog };

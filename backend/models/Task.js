import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Task = sequelize.define('Task', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 200],
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('open', 'in_progress', 'completed'),
            allowNull: false,
            defaultValue: 'open',
        },
        dueDate: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        completedAt: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });

    return Task;
};

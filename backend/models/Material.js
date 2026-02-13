import { DataTypes } from 'sequelize';

export default (sequelize) => {
    const Material = sequelize.define('Material', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                len: [1, 200],
            },
        },
        quantity: {
            type: DataTypes.FLOAT,
            allowNull: false,
            defaultValue: 1,
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: true,
            defaultValue: 'Stück',
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        status: {
            type: DataTypes.ENUM('needed', 'ordered', 'arrived'),
            allowNull: false,
            defaultValue: 'needed',
        },
    });

    return Material;
};

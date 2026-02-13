import { DataTypes } from 'sequelize';
import bcrypt from 'bcrypt';

export default (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                len: [3, 50],
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM('admin', 'helper'),
            allowNull: false,
            defaultValue: 'helper',
        },
        profileImage: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        lastSeen: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });

    // Hash password before saving
    User.beforeCreate(async (user) => {
        if (user.password) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    User.beforeUpdate(async (user) => {
        if (user.changed('password')) {
            user.password = await bcrypt.hash(user.password, 10);
        }
    });

    // Instance method to check password
    User.prototype.checkPassword = async function (password) {
        return await bcrypt.compare(password, this.password);
    };

    // Don't send password in JSON
    User.prototype.toJSON = function () {
        const values = { ...this.get() };
        delete values.password;
        return values;
    };

    return User;
};

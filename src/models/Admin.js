import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  email: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: 'admin',
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'admins',
  timestamps: true,
});

export default Admin;

import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  action: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  entity: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  entityId: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  changes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  adminId: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
}, {
  tableName: 'audit_logs',
  timestamps: true,
  updatedAt: false, // Disables updatedAt column since this is a write-once audit history log
  indexes: [
    {
      fields: ['entity', 'entityId'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

export default AuditLog;

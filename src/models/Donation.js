import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const Donation = sequelize.define('Donation', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  donationNo: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
  },
  donorName: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  donorPhone: {
    type: DataTypes.STRING(20),
    allowNull: false,
  },
  donorAddress: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },
  disclaimerAccepted: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  cause: {
    type: DataTypes.STRING(191),
    defaultValue: 'शतक महोत्सवी निधी (Centenary Celebration Fund)',
  },
  donorEmail: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  panNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    defaultValue: 'ccavenue',
  },
  paymentMode: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  paymentId: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  bankRefNo: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'pending', // 'pending', 'confirmed', 'failed', 'refunded'
  },
  phoneVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  smsSentAt: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  receiptUrl: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'donations',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['donorPhone'] },
    { fields: ['donorEmail'] },
    { fields: ['donationNo'] },
    { fields: ['createdAt'] },
  ],
});

export default Donation;

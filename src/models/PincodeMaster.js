import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const PincodeMaster = sequelize.define('PincodeMaster', {
  pincode: {
    type: DataTypes.STRING(10),
    primaryKey: true,
    allowNull: false,
  },
  city: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  state: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  deliveryCharge: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  estimatedDelivery: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: '3-4 Days',
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'pincode_masters',
  timestamps: true,
});

export default PincodeMaster;

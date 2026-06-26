import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import crypto from 'crypto';

const MerchandiseProduct = sequelize.define('MerchandiseProduct', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  name: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  price: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  oldPrice: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  sizes: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  stock: {
    type: DataTypes.JSON,
    allowNull: false,
  },
  active: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'merchandise_products',
  timestamps: true,
});

export default MerchandiseProduct;

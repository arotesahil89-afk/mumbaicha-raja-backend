import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';
import MerchandiseProduct from './MerchandiseProduct.js';
import crypto from 'crypto';

const MerchandiseOrder = sequelize.define('MerchandiseOrder', {
  id: {
    type: DataTypes.STRING(191),
    primaryKey: true,
    defaultValue: () => crypto.randomUUID(),
  },
  orderNo: {
    type: DataTypes.STRING(191),
    allowNull: false,
    unique: true,
  },
  customerName: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  customerEmail: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  customerPhone: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  productName: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  productId: {
    type: DataTypes.STRING(191),
    allowNull: true,
    references: {
      model: MerchandiseProduct,
      key: 'id',
    },
  },
  size: {
    type: DataTypes.STRING(191),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  unitPrice: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  totalAmount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: 'online',
  },
  paymentId: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  status: {
    type: DataTypes.STRING(191),
    allowNull: false,
    defaultValue: 'pending',
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  pincode: {
    type: DataTypes.STRING(191),
    allowNull: true,
  },
  shipping: {
    type: DataTypes.JSON,
    allowNull: true,
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'merchandise_orders',
  timestamps: true,
  indexes: [
    {
      fields: ['status'],
    },
    {
      fields: ['customerEmail'],
    },
    {
      fields: ['customerPhone'],
    },
    {
      fields: ['createdAt'],
    },
  ],
});

// Set up associations
MerchandiseOrder.belongsTo(MerchandiseProduct, { foreignKey: 'productId', as: 'product' });
MerchandiseProduct.hasMany(MerchandiseOrder, { foreignKey: 'productId', as: 'orders' });

export default MerchandiseOrder;

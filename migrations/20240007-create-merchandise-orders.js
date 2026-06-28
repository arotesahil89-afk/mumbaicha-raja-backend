'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('merchandise_orders', {
    id: {
      type: Sequelize.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    orderNo: {
      type: Sequelize.STRING(191),
      allowNull: false,
      unique: true,
    },
    customerName: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    customerEmail: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    customerPhone: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    productName: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    productId: {
      type: Sequelize.STRING(191),
      allowNull: true,
      references: {
        model: 'merchandise_products',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    },
    size: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    unitPrice: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    totalAmount: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    paymentMethod: {
      type: Sequelize.STRING(191),
      allowNull: false,
      defaultValue: 'online',
    },
    paymentId: {
      type: Sequelize.STRING(191),
      allowNull: true,
    },
    status: {
      type: Sequelize.STRING(191),
      allowNull: false,
      defaultValue: 'pending',
    },
    address: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    shipping: {
      type: Sequelize.JSON,
      allowNull: true,
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
  });

  await queryInterface.addIndex('merchandise_orders', ['status']);
  await queryInterface.addIndex('merchandise_orders', ['customerEmail']);
  await queryInterface.addIndex('merchandise_orders', ['customerPhone']);
  await queryInterface.addIndex('merchandise_orders', ['createdAt']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('merchandise_orders');
}

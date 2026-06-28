'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('pincode_masters', {
    pincode: {
      type: Sequelize.STRING(10),
      primaryKey: true,
      allowNull: false,
    },
    city: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    state: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    deliveryCharge: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    estimatedDelivery: {
      type: Sequelize.STRING(191),
      allowNull: false,
      defaultValue: '3-4 Days',
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
}

export async function down(queryInterface) {
  await queryInterface.dropTable('pincode_masters');
}

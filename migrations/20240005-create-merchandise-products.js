'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('merchandise_products', {
    id: {
      type: Sequelize.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true,
    },
    price: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    oldPrice: {
      type: Sequelize.INTEGER,
      allowNull: true,
    },
    sizes: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    stock: {
      type: Sequelize.JSON,
      allowNull: false,
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
  await queryInterface.dropTable('merchandise_products');
}

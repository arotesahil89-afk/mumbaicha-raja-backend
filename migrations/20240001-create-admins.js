'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('admins', {
    id: {
      type: Sequelize.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: Sequelize.STRING(191),
      allowNull: false,
      unique: true,
    },
    password: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    role: {
      type: Sequelize.STRING(191),
      allowNull: false,
      defaultValue: 'admin',
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
  await queryInterface.dropTable('admins');
}

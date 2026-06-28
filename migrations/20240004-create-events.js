'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('events', {
    id: {
      type: Sequelize.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    titleEn: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    titleHi: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    titleMr: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    descriptionEn: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    descriptionHi: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    descriptionMr: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    eventDate: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    eventTime: {
      type: Sequelize.STRING(191),
      allowNull: false,
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

  await queryInterface.addIndex('events', ['eventDate']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('events');
}

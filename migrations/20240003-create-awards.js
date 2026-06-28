'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('awards', {
    id: {
      type: Sequelize.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    language: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    text: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    heading: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    displayOrder: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
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

  // Unique index on language + text
  await queryInterface.addIndex('awards', ['language', 'text'], { unique: true });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('awards');
}

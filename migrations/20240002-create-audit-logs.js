'use strict';

export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('audit_logs', {
    id: {
      type: Sequelize.STRING(191),
      primaryKey: true,
      allowNull: false,
    },
    action: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    entity: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    entityId: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    changes: {
      type: Sequelize.JSON,
      allowNull: false,
    },
    adminId: {
      type: Sequelize.STRING(191),
      allowNull: false,
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
    },
    // No updatedAt — write-once audit log
  });

  await queryInterface.addIndex('audit_logs', ['entity', 'entityId']);
  await queryInterface.addIndex('audit_logs', ['createdAt']);
}

export async function down(queryInterface) {
  await queryInterface.dropTable('audit_logs');
}

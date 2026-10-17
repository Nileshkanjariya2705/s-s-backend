'use strict';

const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'role_permissions',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          role_uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'roles',
              key: 'uuid',
            },
          },
          permission_uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'permissions',
              key: 'uuid',
            },
          },
          created_at: { type: Sequelize.BIGINT, allowNull: false, defaultValue: new Date().getTime() },
          updated_at: {
            allowNull: true,
            type: Sequelize.BIGINT,
          },
          deleted_at: { type: Sequelize.BIGINT, allowNull: true },
        },
        { transaction: t },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('role_permissions', { transaction: t });
    });
  },
};

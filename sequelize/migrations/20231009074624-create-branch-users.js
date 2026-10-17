'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('branch_users', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        user_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'uuid',
            constraints: false,
          },
        },
        branch_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'branches',
            key: 'uuid',
            constraints: false,
          },
        },
        status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        updated_at: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at: { type: Sequelize.Sequelize.DATE, allowNull: true },
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('branch_users', { transaction: t });
    });
  },
};

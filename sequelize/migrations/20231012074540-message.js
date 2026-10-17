'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('messages', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },

        chat_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'chat',
            key: 'uuid',
          },
        },

        user_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'uuid',
          },
        },

        message: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        attachment: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
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
      await queryInterface.dropTable('messages', { transaction: t });
    });
  },
};

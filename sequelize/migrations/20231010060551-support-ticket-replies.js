'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('support_ticket_messages', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        support_ticket_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'support_ticket',
            key: 'uuid',
          },
        },
        user_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        text: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        attachment: { type: Sequelize.TEXT, allowNull: true },
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
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('support_ticket_messages', { transaction: t });
    });
  },
};

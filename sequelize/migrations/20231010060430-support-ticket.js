'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('support_ticket', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        entity_type: {
          type: Sequelize.ENUM('STORE_OWNER', 'SUPPLIER_OWNER'),
          allowNull: false,
        },
        entity_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        admin_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          defaultValue: 'f29395e1-b97d-4278-8a79-8182299cb3a7',
        },

        subject: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        ticket_number: {
          type: Sequelize.INTEGER,
        },
        admin_last_read: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        client_last_read: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        status: {
          type: Sequelize.ENUM('NEW', 'OPEN', 'CLOSED'),
          allowNull: false,
          defaultValue: 'NEW',
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
      await queryInterface.dropTable('support_ticket', { transaction: t });
    });
  },
};

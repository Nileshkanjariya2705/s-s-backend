'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('notification', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },

        related_entity_type: {
          type: Sequelize.ENUM(
            'PURCHASE_REQUEST',
            'CHAT',
            'SUPPORT_TICKET',
            'ORDERS',
            'STORE_SIGNUP',
            'SUPPLIER_SIGNUP',
          ),
          allowNull: false,
        },

        related_entity_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },

        content_en: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        content_ar: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        content_ur: {
          type: Sequelize.TEXT,
          allowNull: false,
        },

        link_to_entity: {
          type: Sequelize.TEXT,
          allowNull: false,
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
      await queryInterface.dropTable('notification', { transaction: t });
    });
  },
};

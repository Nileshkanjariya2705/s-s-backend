'use strict';
const { UUID4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('purchase_requests', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },

        requester_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'uuid',
          },
        },
        store_info_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'store_info',
            key: 'uuid',
          },
        },
        supplier_info_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'supplier_info',
            key: 'uuid',
          },
        },
        quotes_accepted_upto: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        status: {
          type: Sequelize.ENUM('NEW', 'COMPLETED', 'EXPIRED', 'QUOTED', 'BUY_NOW'),
          allowNull: false,
          defaultValue: 'NEW',
        },
        offer_for_entire_request: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },
        is_closed: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: false },

        total_price: {
          type: Sequelize.FLOAT,
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
      await queryInterface.dropTable('purchase_requests', { transaction: t });
    });
  },
};

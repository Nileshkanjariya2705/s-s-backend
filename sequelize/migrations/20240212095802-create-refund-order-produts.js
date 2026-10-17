'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('refund_order_products', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        refund_order_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'refund_orders',
            key: 'uuid',
          },
        },
        order_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'orders',
            key: 'uuid',
          },
        },
        order_product_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'order_products',
            key: 'uuid',
          },
        },
        product_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'products',
            key: 'uuid',
          },
        },
        reason: {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        refund_product_status: {
          type: Sequelize.ENUM('ACCEPTED', 'REJECTED'),
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
      await queryInterface.dropTable('refund_order_products', { transaction: t });
    });
  },
};

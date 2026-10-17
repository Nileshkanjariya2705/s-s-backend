'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('order_products', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        order_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'orders',
            key: 'uuid',
          },
        },
        quote_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'supplier_product_quotes',
            key: 'uuid',
          },
        },
        entity_type: {
          type: Sequelize.ENUM('existing_purchase_request_products', 'direct_purchase_request_products'),
          allowNull: false,
        },
        entity_id: {
          type: Sequelize.UUID,
          allowNull: false,
        },

        price: {
          type: Sequelize.STRING,
          allowNull: false,
        },

        quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        product_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'products',
            key: 'uuid',
          },
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
      await queryInterface.dropTable('order_products', { transaction: t });
    });
  },
};

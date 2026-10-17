'use strict';
const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('purchase_request_products', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        purchase_request_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'purchase_requests',
            key: 'uuid',
          },
        },
        product_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'products',
            key: 'uuid',
          },
        },
        category_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'category',
            key: 'uuid',
          },
        },
        requested_price: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        requested_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        description: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        allow_other_brands: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        is_purchased: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
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
      await queryInterface.dropTable('purchase_request_products', { transaction: t });
    });
  },
};

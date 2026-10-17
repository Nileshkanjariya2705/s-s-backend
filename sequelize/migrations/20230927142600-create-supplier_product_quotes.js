'use strict';

const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('supplier_product_quotes', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        purchase_request_products_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'purchase_request_products',
            key: 'uuid',
          },
        },
        offered_price: {
          type: Sequelize.FLOAT,
          allowNull: false,
        },
        offered_quantity: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        is_approved: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        other_brand_product_uuid: {
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
      await queryInterface.dropTable('supplier_product_quotes', { transaction: t });
    });
  },
};

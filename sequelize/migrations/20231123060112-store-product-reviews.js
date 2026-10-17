'use strict';

const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('store_product_reviews', {
        uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: UUID4,
        },
        product_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'products',
            key: 'uuid',
          },
        },
        review_by: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'users',
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
        store_info_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'store_info',
            key: 'uuid',
          },
        },
        reviews: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        rating: {
          type: Sequelize.BIGINT,
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
      await queryInterface.dropTable('store_product_reviews', { transaction: t });
    });
  },
};

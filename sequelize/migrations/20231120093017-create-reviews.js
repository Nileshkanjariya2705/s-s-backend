'use strict';

const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('reviews', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },

        order_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'orders',
            key: 'uuid',
          },
        },

        purchase_request_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'purchase_requests',
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
      await queryInterface.dropTable('reviews', { transaction: t });
    });
  },
};

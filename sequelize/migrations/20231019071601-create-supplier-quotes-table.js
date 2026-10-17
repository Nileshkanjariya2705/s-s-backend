'use strict';

const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('supplier_quotes', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },

        purchase_request_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
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
        quoted_by: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'uuid',
          },
        },
        charges_and_total: {
          type: Sequelize.FLOAT,
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
      await queryInterface.dropTable('supplier_quotes', { transaction: t });
    });
  },
};

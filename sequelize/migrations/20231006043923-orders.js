'use strict';

const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('orders', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        created_by: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        purchase_request_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'purchase_requests',
            key: 'uuid',
          },
        },

        address_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'address',
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

        supplier_info_uuid: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'supplier_info',
            key: 'uuid',
          },
        },

        additional_info: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        status: {
          type: Sequelize.ENUM('PENDING', 'FAILED', 'COMPLETED'),
          allowNull: false,
          defaultValue: 'PENDING',
        },

        payment_mode: {
          type: Sequelize.ENUM('CARD', 'BANK_TRANSFER'),
          allowNull: false,
        },

        payment_receipt: {
          type: Sequelize.TEXT,
          allowNull: true,
        },

        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },

        is_mail_sent: {
          type: Sequelize.BOOLEAN,
          defaultValue: 0,
          allowNull: true,
        },

        updated_at: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at: { type: Sequelize.DATE, allowNull: true },
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('orders', { transaction: t });
    });
  },
};

'use strict';
const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('saved_card', {
        uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: UUID4,
        },

        store_info_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'store_info',
            key: 'uuid',
          },
        },

        token_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        card_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        customer_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },

        card_name: {
          type: Sequelize.UUID,
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
      await queryInterface.dropTable('saved_card', { transaction: t });
    });
  },
};

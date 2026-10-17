'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('branches', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        entity_type: {
          allowNull: false,
          type: Sequelize.ENUM('STORE', 'SUPPLIER'),
        },
        entity_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        address: {
          type: Sequelize.TEXT,
          allowNull: false,
        },
        city: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        state: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        country: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
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
      await queryInterface.dropTable('branches', { transaction: t });
    });
  },
};

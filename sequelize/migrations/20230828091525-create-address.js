'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUIDV4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('address', {
        uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          primaryKey: true,
          defaultValue: UUIDV4,
        },
        user_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'users',
            key: 'uuid',
          },
        },
        entity_info_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        entity_type: {
          type: Sequelize.STRING,
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
        postal_code: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        phone: {
          type: Sequelize.BIGINT,
          allowNull: false,
        },
        is_default: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        created_at: { type: Sequelize.BIGINT, allowNull: false, defaultValue: new Date().getTime() },
        updated_at: {
          allowNull: true,
          type: Sequelize.BIGINT,
        },
        deleted_at: { type: Sequelize.BIGINT, allowNull: true },
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('address', { transaction: t });
    });
  },
};

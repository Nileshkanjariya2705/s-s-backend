'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUIDV4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'account_users',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          entity_type: {
            allowNull: true,
            type: Sequelize.ENUM('STORE', 'SUPPLIER'),
          },
          entity_uuid: {
            type: Sequelize.UUID,
            allowNull: true,
          },
          user_uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'users',
              key: 'uuid',
              constraints: false,
            },
            // onUpdate: 'CASCADE',
            // onDelete: 'CASCADE',
          },
          role_uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            references: {
              model: 'roles',
              key: 'uuid',
            },
          },
          created_at: { type: Sequelize.BIGINT, allowNull: false, defaultValue: new Date().getTime() },
          updated_at: {
            allowNull: true,
            type: Sequelize.BIGINT,
          },
          deleted_at: { type: Sequelize.BIGINT, allowNull: true },
        },
        { transaction: t },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('account_users', { transaction: t });
    });
  },
};

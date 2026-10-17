'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUIDV4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'permissions',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          slug: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
          },
          created_at: { type: Sequelize.BIGINT, allowNull: false, defaultValue: new Date().getTime() },

          updated_at: {
            allowNull: true,
            type: Sequelize.BIGINT,
          },
          deleted_at: {
            type: Sequelize.BIGINT,
            allowNull: true,
          },
        },
        { transaction: t },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('permissions', { transaction: t });
    });
  },
};

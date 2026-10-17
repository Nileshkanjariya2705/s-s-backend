'use strict';

/** @type {import('sequelize-cli').Migration} */

const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'users',
        {
          uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
          email: { type: Sequelize.STRING, allowNull: false },
          username: { type: Sequelize.STRING, allowNull: false },
          image: { type: Sequelize.TEXT, allowNull: true },
          phone: { type: Sequelize.BIGINT, allowNull: true },
          password: { type: Sequelize.STRING, allowNull: false },
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
      await queryInterface.dropTable('users', { transaction: t });
    });
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUIDV4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'supplier_info',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          company_name: {
            allowNull: false,
            type: Sequelize.STRING,
          },
          cr_number: {
            allowNull: false,
            type: Sequelize.BIGINT,
          },
          iban_number: {
            allowNull: true,
            type: Sequelize.STRING,
          },
          tax_number: {
            allowNull: true,
            type: Sequelize.STRING,
          },
          address: {
            allowNull: true,
            type: Sequelize.TEXT,
          },
          is_verified: {
            allowNull: false,
            type: Sequelize.BOOLEAN,
            defaultValue: false,
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
      await queryInterface.dropTable('supplier_info', { transaction: t });
    });
  },
};

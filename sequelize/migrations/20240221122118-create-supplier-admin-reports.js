'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('supplier_admin_reports', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        supplier_info_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'supplier_info',
            key: 'uuid',
          },
        },
        month: { type: Sequelize.INTEGER, allowNull: false },
        year: { type: Sequelize.INTEGER, allowNull: false },
        status: {
          type: Sequelize.ENUM('PENDING', 'PAID'),
          defaultValue: 'PENDING',
        },
        file: {
          allowNull: true,
          type: Sequelize.TEXT('long'),
        },
        sheets: {
          allowNull: true,
          type: Sequelize.TEXT('long'),
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
      await queryInterface.dropTable('supplier_admin_reports', { transaction: t });
    });
  },
};

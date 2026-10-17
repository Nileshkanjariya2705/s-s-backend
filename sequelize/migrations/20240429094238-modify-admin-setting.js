'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('admin_settings', 'default_ord_commission', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('admin_settings', 'default_bank_commission', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('admin_settings', 'current_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('admin_settings', 'default_ord_commission');
    await queryInterface.removeColumn('admin_settings', 'default_bank_commission');
    await queryInterface.removeColumn('admin_settings', 'current_active');
  },
};

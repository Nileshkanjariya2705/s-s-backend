'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('store_info', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    });
    queryInterface.addColumn('supplier_info', 'is_active', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: 1,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('store_info', 'is_active');
    queryInterface.removeColumn('supplier_info', 'is_active');
  },
};

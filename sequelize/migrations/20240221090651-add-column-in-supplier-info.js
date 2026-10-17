'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('supplier_info', 'Ord_Commission', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    }),
      await queryInterface.addColumn('supplier_info', 'Bank_Commission', {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('supplier_info', 'Ord_Commission', {});
    await queryInterface.removeColumn('supplier_info', 'Bank_Commission', {});
  },
};

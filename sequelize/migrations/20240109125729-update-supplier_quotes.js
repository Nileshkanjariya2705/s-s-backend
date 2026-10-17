'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('supplier_quotes', 'charges', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('supplier_quotes', 'charges');
  }
};

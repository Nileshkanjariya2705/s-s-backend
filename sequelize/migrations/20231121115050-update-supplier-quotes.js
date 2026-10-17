'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('supplier_quotes', 'payment_method', {
      type: Sequelize.ENUM('CARD', 'BANK_TRANSFER'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('supplier_quotes', 'payment_method');
  },
};

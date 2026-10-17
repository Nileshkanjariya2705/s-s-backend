'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'amount_without_vat', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 0,
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'amount_without_vat', {});
  }
};

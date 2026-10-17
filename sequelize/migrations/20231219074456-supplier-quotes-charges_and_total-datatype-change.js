'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('supplier_quotes', 'charges_and_total', {
      allowNull: true,
      type: Sequelize.DOUBLE,
    });
  },

  async down(queryInterface, Sequelize) {},
};

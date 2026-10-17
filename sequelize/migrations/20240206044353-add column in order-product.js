'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('order_products', 'replacement_reason', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
    await queryInterface.addColumn('order_products', 'replacement_request', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_products', 'reason_replacement', {});
    await queryInterface.removeColumn('order_products', 'replacement_request', {});
  },
};

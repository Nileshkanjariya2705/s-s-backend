'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('order_products', 'refund_request', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue:false
    });
    await queryInterface.addColumn('order_products', 'refund_reason', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_products', 'refund_request');
    await queryInterface.removeColumn('order_products', 'refund_reason');
  }
};

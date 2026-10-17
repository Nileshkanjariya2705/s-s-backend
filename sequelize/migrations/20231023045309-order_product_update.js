'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('order_products', 'entity_type');
    await queryInterface.removeColumn('order_products', 'entity_id');
  },

  async down (queryInterface, Sequelize) {
    // await queryInterface.addColumn('order_products', 'entity_type');
    // await queryInterface.addColumn('order_products', 'entity_id');
  }
};

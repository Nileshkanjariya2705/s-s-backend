'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('supplier_products', 'product_images');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('supplier_products', 'product_images', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

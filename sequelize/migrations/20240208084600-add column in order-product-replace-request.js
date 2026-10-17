'use strict';

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
   await queryInterface.addColumn('order_products_replace_request', 'replacement_product_status', {
      type: Sequelize.ENUM('ACCEPTED', 'REJECTED'),
      allowNull: true,
    });
    await queryInterface.addColumn('order_products_replace_request', 'product_uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'products',
        key: 'uuid',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('order_products_replace_request', 'replacement_product_status');
    queryInterface.removeColumn('order_products_replace_request', 'product_uuid');
  },
};

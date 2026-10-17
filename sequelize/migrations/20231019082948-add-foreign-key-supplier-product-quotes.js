'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('supplier_product_quotes', 'supplier_quotes_uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'supplier_quotes',
        key: 'uuid',
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('supplier_product_quotes', 'supplier_quotes_uuid');
  },
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('supplier_products', 'supplier_uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'uuid',
      },
    });
    await queryInterface.addColumn('supplier_products', 'supplier_info_uuid', {
      type: Sequelize.UUID,
      allowNull: false,
      references: {
        model: 'supplier_info',
        key: 'uuid',
      },
    });
    await queryInterface.addColumn('supplier_products', 'product_images', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('supplier_products', 'units', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('supplier_products', 'base_price', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.addColumn('supplier_products', 'is_purchaseable', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('supplier_products', 'supplier_uuid');
    await queryInterface.removeColumn('supplier_products', 'product_images');
    await queryInterface.removeColumn('supplier_products', 'units');
    await queryInterface.removeColumn('supplier_products', 'base_price');
    await queryInterface.removeColumn('supplier_products', 'is_purchaseable');
  },
};

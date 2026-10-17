'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'refund_request', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('orders', 'refund_accepted_admin', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
    await queryInterface.addColumn('orders', 'refund_accepted_supplier', {
      type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'refund_request');
    await queryInterface.removeColumn('orders', 'refund_accepted_admin');
    await queryInterface.removeColumn('orders', 'refund_accepted_supplier');
  },
};

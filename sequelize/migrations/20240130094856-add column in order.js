'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'reason_for_cancel', {
      type: Sequelize.TEXT('long'),
      allowNull: true,
    });
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'),
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('orders', 'reason_for_cancel');
  },
};

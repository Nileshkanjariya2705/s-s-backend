'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('PENDING', 'ACCEPTED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED'),
      allowNull: false,
      defaultValue: 'PENDING',
    });
  },

  async down(queryInterface, Sequelize) {},
};

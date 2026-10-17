'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'replacement_request', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue:false,
    });
    await queryInterface.addColumn('orders', 'replacement_status', {
      type: Sequelize.ENUM('ACCEPTED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED','REJECTED' ,'PENDING'),
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'replacement_request', {});
    await queryInterface.removeColumn('orders', 'replacement_status', {});
  }
};

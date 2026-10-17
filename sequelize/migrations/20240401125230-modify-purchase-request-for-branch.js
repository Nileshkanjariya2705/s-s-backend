'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('purchase_requests', 'address_uuid', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'address',
        key: 'uuid',
      },
  
    })
    await queryInterface.addColumn('purchase_requests', 'branch_uuid', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'uuid',
      },
  
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('purchase_requests', 'address_uuid');
    await queryInterface.removeColumn('purchase_requests', 'branch_uuid');
  }
};

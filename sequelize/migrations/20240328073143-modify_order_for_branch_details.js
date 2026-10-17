'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'branch_uuid', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'uuid',
      },
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'branch_uuid');
  }
};

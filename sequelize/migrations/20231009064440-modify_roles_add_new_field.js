'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('roles', 'status', {
      type: Sequelize.ENUM('INACTIVE', 'ACTIVE'),
      allowNull: true,
      defaultValue: 'INACTIVE',
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('roles', 'status');
  },
};

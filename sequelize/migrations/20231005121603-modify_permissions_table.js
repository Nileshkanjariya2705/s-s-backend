'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('permissions', 'permission_owner', {
      type: Sequelize.ENUM('STORE', 'SUPPLIER'),
      allowNull: false,
    });
    await queryInterface.addColumn('permissions', 'permission_type', {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('permissions', 'permission_owner');
    await queryInterface.removeColumn('permissions', 'permission_type');
  },
};

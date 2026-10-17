'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('roles', 'name_ar', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
    await queryInterface.addColumn('roles', 'name_ur', {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('roles', 'name_ar');
    await queryInterface.removeColumn('roles', 'name_ur');
  },
};

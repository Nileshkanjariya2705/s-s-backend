'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('admin_settings', 'refundable_days', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 5,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('admin_settings', 'refundable_days', {});
  },
};

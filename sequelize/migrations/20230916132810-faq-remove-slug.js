'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('faq', 'slug');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('faq', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

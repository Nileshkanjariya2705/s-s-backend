'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn('cms_review', 'slug');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('cms_review', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};

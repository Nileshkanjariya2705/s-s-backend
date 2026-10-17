'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('faq', 'question', {
      type: Sequelize.TEXT('long'),
    });
    await queryInterface.addColumn('faq', 'slug', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('faq', 'question', {
      type: Sequelize.STRING,
    });
    await queryInterface.removeColumn('faq', 'slug');
  },
};

'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      unique: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('users', 'email', {
      type: Sequelize.STRING,
      unique: false,
    });
  },
};

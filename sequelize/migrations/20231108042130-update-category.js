'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('category','name_ur',{
      type: Sequelize.STRING, allowNull: false
    })
    await queryInterface.addColumn('category','name_ar',{
      type: Sequelize.STRING, allowNull: false
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('category','name_ur')
    await queryInterface.removeColumn('category','name_ar')
  }
};

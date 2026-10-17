'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
   await queryInterface.addColumn('measurement','unit_name_ar',{
    type: Sequelize.STRING, allowNull: false 
   })
   await queryInterface.addColumn('measurement','unit_short_name_ar',{
    type: Sequelize.STRING, allowNull: false 
   })
   await queryInterface.addColumn('measurement','unit_name_ur',{
    type: Sequelize.STRING, allowNull: false 
   })
   await queryInterface.addColumn('measurement','unit_short_name_ur',{
    type: Sequelize.STRING, allowNull: false 
   })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('measurement','unit_name_ar')
    await queryInterface.removeColumn('measurement','unit_short_name_ar')
    await queryInterface.removeColumn('measurement','unit_name_ur')
    await queryInterface.removeColumn('measurement','unit_short_name_ur')
  }
};

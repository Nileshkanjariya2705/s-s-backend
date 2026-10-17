'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('address', 'user_uuid',{
      allowNull: true,
      type:Sequelize.UUID
    })
    await queryInterface.changeColumn('address', 'entity_info_uuid',{
      allowNull: true,
      type:Sequelize.UUID
    })
    await queryInterface.addColumn('address', 'branch_uuid', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'branches',
        key: 'uuid',
      },
  
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('address', 'user_uuid',{
      allowNull: false,
      type:Sequelize.UUID
    })
    await queryInterface.changeColumn('address', 'entity_info_uuid',{
      allowNull: false,
      type:Sequelize.UUID
    })
    await queryInterface.removeColumn('address', 'branch_uuid');
  },
};

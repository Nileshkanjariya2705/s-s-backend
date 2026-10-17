'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('admin_settings', [
      {
        uuid: uuidv4(),
        vat_percentage: 0.0,
        replacement_days: 5,
        refundable_days: 5,
        default_ord_commission:5.3,
        default_bank_commission:5.4,
        current_active:true
      },
    ]);
  },
  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('admin_settings', null, {});
  },
  
};

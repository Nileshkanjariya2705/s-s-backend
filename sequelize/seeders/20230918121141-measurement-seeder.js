'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('measurement', [
      {
        uuid: uuidv4(),
        status: 'ACTIVE',
        unit_name: 'Kilogram',
        unit_short_name: 'kg',
        unit_name_ar: 'كيلوغرام',
        unit_short_name_ar: 'كلغ',
        unit_name_ur: 'کلوگرام',
        unit_short_name_ur: 'کلو',
      },
      {
        uuid: uuidv4(),
        status: 'ACTIVE',
        unit_name: 'Gram',
        unit_short_name: 'g',
        unit_name_ar: 'غرام',
        unit_short_name_ar: 'ز',
        unit_name_ur: 'چنے',
        unit_short_name_ur: 'جی',
      },
      {
        uuid: uuidv4(),
        status: 'ACTIVE',
        unit_name: 'Litre',
        unit_short_name: 'l',
        unit_name_ar: 'لتر',
        unit_short_name_ar: 'ل',
        unit_name_ur: 'لیٹر',
        unit_short_name_ur: 'ایل',
      },
      {
        uuid: uuidv4(),
        status: 'ACTIVE',
        unit_name: 'Mole',
        unit_short_name: 'mol',
        unit_name_ar: 'خلد',
        unit_short_name_ar: 'مول',
        unit_name_ur: 'تل',
        unit_short_name_ur: 'مول',
      },
    ]);
  },
};

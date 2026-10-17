'use strict';

/** @type {import('sequelize-cli').Migration} */
const Roles = [
  {
    uuid: 'c21204a1-d30e-4f51-a541-edce68fe4ff7',
    name: 'SUPER_ADMIN',
    name_ar: 'المشرف العام',
    name_ur: 'سپر ایڈمن',
    slug: 'SUPER-ADMIN',
    status: 'ACTIVE',
  },
  {
    uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    name: 'STORE_OWNER',
    name_ar: 'صاحب المتجر',
    name_ur: 'اسٹور مالک',
    slug: 'STORE-OWNER',
    status: 'ACTIVE',
  },
  {
    uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    name: 'SUPPLIER_OWNER',
    name_ar: 'صاحب المورد',
    name_ur: 'سپلائر مالک',
    slug: 'SUPPLIER-OWNER',
    status: 'ACTIVE',
  },
];

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('roles', Roles);
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('roles', null, {});
  },
};

'use strict';

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
  up: async (queryInterface, Sequelize) => {
    const existingRoles = await queryInterface.sequelize.query('SELECT * FROM roles', {
      type: queryInterface.sequelize.QueryTypes.SELECT,
    });

    for (const role of Roles) {
      const existingRole = existingRoles.find((r) => r.uuid === role.uuid);

      if (existingRole) {
        await queryInterface.bulkUpdate('roles', role, { uuid: role.uuid });
        console.log(`Updated role with uuid ${role.uuid}`);
      } 
      await queryInterface.bulkUpdate(
        'roles',
        { name_ar: 'صاحب المورد', name_ur: 'سپلائر مالک' },
      );
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      uuid: Roles.map((role) => role.uuid),
    });
  },
};

'use strict';
/** @type {import('sequelize-cli').Migration} */
const SUPER_ADMIN_DATA = [
  {
    uuid: 'f29395e1-b97d-4278-8a79-8182299cb3a7',
    email: 'admin@gmail.com',
    password: '$2b$10$qUjvw.7r9NuNBheT7QiIYOq56DyQF0YFAeDHfSPtx2fB7N7luvgN.',
    username: 'admin',
  },
];
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async (t) => {
        const default_role_uuid = await queryInterface.sequelize.query(
          'SELECT * FROM `roles` WHERE name = "SUPER_ADMIN"',
          {
            type: Sequelize.QueryTypes.SELECT,
          },
        );

        await queryInterface.bulkInsert('users', SUPER_ADMIN_DATA, { transaction: t });
        await queryInterface.bulkInsert(
          'account_users',
          [
            {
              uuid: '3824373e-b159-4815-a6b5-cbea47ae8755',
              user_uuid: 'f29395e1-b97d-4278-8a79-8182299cb3a7',
              role_uuid: default_role_uuid[0]?.uuid,
            },
          ],
          { transaction: t },
        );
      });
    } catch (error) {
      return error;
    }
  },
  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async (t) => {
        await queryInterface.bulkDelete(
          'roles',
          { user_uuid: 'f29395e1-b97d-4278-8a79-8182299cb3a7' },
          { transaction: t },
        );
      });
      await queryInterface.bulkDelete('users', { email: 'admin@gmail.com' }, {});
      await queryInterface.bulkDelete('account_users', { entity_uuid: '48249613-8750-4c13-837a-28b70b4ecf2b' }, {});
    } catch (error) {
      return error;
    }
  },
};

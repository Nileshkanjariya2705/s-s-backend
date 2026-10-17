'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');
const Role_permission = [
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '15726699-1574-44e9-b8d1-1226ff82f989',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '18bd7486-d0a7-4bd3-945b-e0d2c9e94fa4',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '5340a250-4137-4f77-98f5-a5fc5edacd38',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '57e70e03-5a86-4153-bd15-708299a1caa3',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '5fd4a97e-9fec-4b6e-bdb9-9e9f7442afb5',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '6f78fa81-68d2-4426-b8c6-cfc50f9f6ce8',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '71b8886f-7136-401f-89b5-d00797f2619f',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '73843ce7-9aaf-4cea-82a4-c2ea8847c096',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '7ab3022d-ddeb-4513-bb32-a2ead33252af',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '8fa24d15-2cb7-41c5-aab1-2a4062e7647c',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: '94410364-e58f-46a5-9437-4ab1535751c4',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'b1c8e2ef-7286-437d-b92e-e7523fa73fb5',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'b480448e-bf85-4a56-b085-b1063d832444',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'b7a9867e-9beb-42c4-9b07-16e6a7343d3e',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'c04ddc9b-9eea-40f0-ac1d-3fd3ffba7ce4',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'cac46491-ae9a-4cdb-991d-02549ce0e2ff',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'd0949baf-14a3-41dd-a48f-1b629c9a7672',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'ddf1aa08-81b4-4f93-90f4-105aa110b8b2',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'eef588fd-8902-41c9-b2cb-d1b24a1de14b',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'eefd8f1f-bbd9-44ac-a0a5-289657d205a5',
  },
  {
    uuid: uuidv4(),
    role_uuid: '602bdefd-42df-41e0-996f-75329b8f2430',
    permission_uuid: 'fb7fa506-0d9c-4b19-b083-4f43d7e775bb',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '16b91c56-4916-4500-ba76-76040895872b',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '189df3a4-c0e2-4f2a-9cc4-9714452f5138',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '2a0ebdc7-ddd5-46a9-ad97-272d0a6df12b',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '2f602026-32bd-4782-8396-4e161340e4ab',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '3d3579d8-62b6-406d-bafe-18a127800bba',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '4f345245-d0e4-4c61-8094-a4c8f83f17ef',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '55f6f751-e890-4cb5-b90a-9f0602c2e092',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '8030934e-2c83-450f-836c-87837eb4c93e',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '8158d054-1e3e-452c-9b08-c2ee02079844',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '8aa82464-96f3-436d-b23c-4e4d4325f196',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '8bad625f-24c8-46fc-bce0-17edf6030500',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '8f99a20c-c215-44fe-8088-da69c0c04444',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '915c6cb7-b2fd-467f-a1a8-66c53323f0c6',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'ab3bd0bc-f8e1-4e9d-af1c-3ab80ad758d7',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'b48a9abd-fd42-4eef-9bf0-2eca26c23901',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'bb815c7d-a3a7-42cc-8a71-b5792c761e22',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'c2486109-f39a-494f-967a-865af973dd4d',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'cda07216-f5c4-4d0e-8500-c403b7411ce0',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'cff1a4bb-de00-4730-92ef-9abb09f1ee8f',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'd831e8b0-9c77-4eb6-9fb8-b788a7fa7522',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'ded73cc6-e715-45a7-bd12-c472bce5064a',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: 'f151a3c7-2d72-4329-8b0b-ffbf8468221a',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '4e420317-ec8c-4eb3-a243-42b70b53999d',
  },
  {
    uuid: uuidv4(),
    role_uuid: 'b5ecb00f-33cf-4f92-9ba9-eb14a789fb07',
    permission_uuid: '0782bcf9-4ac2-4935-86b8-2e790ab678b5',
  },
];
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('role_permissions', Role_permission);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('role_permissions', null, {});
  },
};

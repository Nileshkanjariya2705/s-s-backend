'use strict';
const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'cms_pages',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          page_title: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          page_description: {
            type: Sequelize.TEXT,
            allowNull: false,
          },
          cms_content_en: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          cms_content_ur: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          cms_content_ar: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          slug: {
            type: Sequelize.STRING,
            allowNull: false,
          },
          created_at: { type: Sequelize.BIGINT, allowNull: false, defaultValue: new Date().getTime() },
          updated_at: {
            allowNull: true,
            type: Sequelize.BIGINT,
          },
          deleted_at: { type: Sequelize.BIGINT, allowNull: true },
        },
        { transaction: t },
      );
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('cms_pages', { transaction: t });
    });
  },
};

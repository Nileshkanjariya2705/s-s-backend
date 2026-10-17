'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUIDV4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'blog_details',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          title_en: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          body_en: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          title_ar: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          body_ar: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          title_ur: {
            type: Sequelize.TEXT,
            allowNull: true,
          },
          body_ur: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          cover_image: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          author_name_en: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          author_name_ar: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          author_name_ur: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          author_image: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          slug: {
            type: Sequelize.STRING,
            allowNull: true,
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
      await queryInterface.dropTable('blog_details', { transaction: t });
    });
  },
};

'use strict';
const { UUIDV4 } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'cms_review',
        {
          uuid: {
            type: Sequelize.UUID,
            allowNull: false,
            primaryKey: true,
            defaultValue: UUIDV4,
          },
          rating: {
            type: Sequelize.INTEGER,
            allowNull: false,
          },
          card_description_en: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          customer_name_en: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          customer_designation_en: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          card_description_ar: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          customer_name_ar: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          customer_designation_ar: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          card_description_ur: {
            type: Sequelize.TEXT('long'),
            allowNull: true,
          },
          customer_name_ur: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          customer_designation_ur: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          profile_image: {
            type: Sequelize.TEXT,
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
      await queryInterface.dropTable('cms_review', { transaction: t });
    });
  },
};

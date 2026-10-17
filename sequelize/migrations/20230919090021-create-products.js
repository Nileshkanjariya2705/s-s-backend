'use strict';

/** @type {import('sequelize-cli').Migration} */
const { UUID4 } = require('sequelize');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable('products', {
        uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
        category_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'category',
            key: 'uuid',
          },
        },
        measurement_uuid: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'measurement',
            key: 'uuid',
          },
        },
        name_en: { type: Sequelize.STRING, allowNull: false },
        name_ar: { type: Sequelize.STRING, allowNull: false },
        name_ur: { type: Sequelize.STRING, allowNull: false },
        overview_en: { type: Sequelize.TEXT, allowNull: false },
        overview_ar: { type: Sequelize.TEXT, allowNull: false },
        overview_ur: { type: Sequelize.TEXT, allowNull: false },
        description_en: { type: Sequelize.TEXT, allowNull: false },
        description_ar: { type: Sequelize.TEXT, allowNull: false },
        description_ur: { type: Sequelize.TEXT, allowNull: false },
        specification_en: { type: Sequelize.TEXT, allowNull: false },
        specification_ar: { type: Sequelize.TEXT, allowNull: false },
        specification_ur: { type: Sequelize.TEXT, allowNull: false },
        images: { type: Sequelize.STRING, allowNull: false },
        featured_image: { type: Sequelize.STRING, allowNull: false },
        status: { type: Sequelize.ENUM('ACTIVE', 'INACTIVE'), allowNull: false },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          allowNull: true,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
        },
        deleted_at: { type: Sequelize.Sequelize.DATE, allowNull: true },
      });
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('products', { transaction: t });
    });
  },
};

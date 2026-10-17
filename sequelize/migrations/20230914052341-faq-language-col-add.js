'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.changeColumn(
        'faq',
        'question',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        { transaction: t },
      );
      await queryInterface.changeColumn(
        'faq',
        'answer',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        { transaction: t },
      );
      await queryInterface.renameColumn('faq', 'question', 'question_en', { transaction: t });
      await queryInterface.renameColumn('faq', 'answer', 'answer_en', { transaction: t });
      await queryInterface.addColumn(
        'faq',
        'question_ar',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        { transaction: t },
      );
      await queryInterface.addColumn(
        'faq',
        'answer_ar',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        { transaction: t },
      );
      await queryInterface.addColumn(
        'faq',
        'question_ur',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        { transaction: t },
      );
      await queryInterface.addColumn(
        'faq',
        'answer_ur',
        {
          type: Sequelize.TEXT('long'),
          allowNull: true,
        },
        { transaction: t },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.renameColumn('faq', 'question_en', 'question', { transaction: t });
      await queryInterface.renameColumn('faq', 'answer_en', 'answer', { transaction: t });
      await queryInterface.removeColumn('faq', 'question_ar', { transaction: t });
      await queryInterface.removeColumn('faq', 'answer_ar', { transaction: t });
      await queryInterface.removeColumn('faq', 'question_ur', { transaction: t });
      await queryInterface.removeColumn('faq', 'answer_ur', { transaction: t });
    });
  },
};

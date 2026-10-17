'use strict';

const { UUID4 } = require('sequelize');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.createTable(
        'payment_detail',
        {
          uuid: { type: Sequelize.UUID, allowNull: false, primaryKey: true, defaultValue: UUID4 },
          order_id: {
            type: Sequelize.UUID,
            allowNull: true,
            references: {
              model: 'orders',
              key: 'uuid',
            },
          },
          payment_status: {
            type: Sequelize.ENUM('SUCCESS', 'FAILED', 'PENDING'),
            allowNull: true,
          },
          amount: { type: Sequelize.FLOAT, allowNull: true },
          charge_id: { type: Sequelize.STRING, allowNull: true },
          payment_method_type: { type: Sequelize.STRING, allowNull: true },
          created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
          },
          updated_at: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          deleted_at: { type: Sequelize.Sequelize.DATE, allowNull: true },
        },
        { transaction: t },
      );
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.dropTable('payment_detail', { transaction: t });
    });
  },
};

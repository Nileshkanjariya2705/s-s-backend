'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('payment_detail', 'payer_email', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail', 'payer_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail', 'order_payment_timestamp', {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail', 'customer_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail', 'payed_by_save_card', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail', 'tap_order_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail', 'card_id', {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn('payment_detail','confirm_amount_payed',{
      type:Sequelize.FLOAT,
      allowNull:true
    })
    await queryInterface.addColumn('payment_detail','tap_payment_response',{
      type: Sequelize.JSON,
      allowNull:true
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('payment_detail', 'payer_email');
    await queryInterface.removeColumn('payment_detail', 'payer_name');
    await queryInterface.removeColumn('payment_detail', 'order_payment_timestamp');
    await queryInterface.removeColumn('payment_detail', 'customer_id');
    await queryInterface.removeColumn('payment_detail', 'payed_by_save_card');
    await queryInterface.removeColumn('payment_detail', 'tap_order_id');
    await queryInterface.removeColumn('payment_detail', 'card_id');
    await queryInterface.removeColumn('payment_detail', 'confirm_amount_payed');
    await queryInterface.removeColumn('payment_detail', 'tap_payment_response');
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notification', 'related_entity_type', {
      type: Sequelize.ENUM(
        'PURCHASE_REQUEST',
        'CHAT',
        'SUPPORT_TICKET',
        'ORDERS',
        'STORE_SIGNUP',
        'SUPPLIER_SIGNUP',
        'PURCHASE_REQUEST_CLOSED',
        'PURCHASE_REQUEST_REJECT',
        'NEW_ORDER_REPLACEMENT',
        'ORDER_REPLACEMENT_APPROVAL',
        'ORDER_REPLACEMENT_REJECT',
        'NEW_ORDER_REFUND',
        'ORDER_REFUND_APPROVAL',
        "ORDER_REFUND_REJECT",
        "PAYMENT_APPROVAL"
      ),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('notification', 'related_entity_type', {
      type: Sequelize.ENUM(
        'PURCHASE_REQUEST',
        'CHAT',
        'SUPPORT_TICKET',
        'ORDERS',
        'STORE_SIGNUP',
        'SUPPLIER_SIGNUP',
      )
    })

  },
};

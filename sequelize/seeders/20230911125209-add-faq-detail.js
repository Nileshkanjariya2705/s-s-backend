'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('faq', [
      {
        uuid: uuidv4(),
        question_en: 'I am a new user. How should I start?',
        answer_en:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Proin libero nunc consequat interdum.Condimentum lacinia quis vel eros donec ac',

        question_ar: 'أنا مستخدم جديد. كيف يجب أن أبدأ؟',
        answer_ar:
          'أنا مستخدم جديد. كيف يجب أن أبدأ؟أنا مستخدم جديد. كيف يجب أن أبدأ؟أنا مستخدم جديد. كيف يجب أن أبدأ؟',
        question_ur: 'میں ایک نیا صارف ہوں۔ میں کیسے شروع کروں؟',
        answer_ur: 'میں ایک نیا صارف ہوں۔ میں کیسے شروع کروں؟',
      },
      {
        uuid: uuidv4(),
        question_en: 'How to buy a product?',
        answer_en:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Proin libero nunc consequat interdum.Condimentum lacinia quis vel eros donec ac',
        question_ur: 'پروڈکٹ کیسے خریدیں؟',
        answer_ur: 'پروڈکٹ کیسے خریدیں؟پروڈکٹ کیسے خریدیں؟پروڈکٹ کیسے خریدیں؟پروڈکٹ کیسے خریدیں؟پروڈکٹ کیسے خریدیں؟',
        question_ar: 'كيفية شراء المنتج؟',
        answer_ar: 'كيفية شراء المنتج؟كيفية شراء المنتج؟كيفية شراء المنتج؟كيفية شراء المنتج؟',
      },
      {
        uuid: uuidv4(),
        question_en: 'Returns and refunds',
        answer_en:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Proin libero nunc consequat interdum.Condimentum lacinia quis vel eros donec ac',
        question_ar: 'الأستبدال والترجيع',
        answer_ar: 'الأستبدال والترجيعالأستبدال والترجيعالأستبدال والترجيعالأستبدال والترجيع',
        question_ur: 'واپسی اور رقم کی واپسی۔',
        answer_ur: 'واپسی اور رقم کی واپسی۔واپسی اور رقم کی واپسی۔واپسی اور رقم کی واپسی۔واپسی اور رقم کی واپسی۔',
      },
      {
        uuid: uuidv4(),
        question_en: 'Are my details secured?',
        answer_en:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Proin libero nunc consequat interdum.Condimentum lacinia quis vel eros donec ac',
        question_ar: 'هل بياناتي مؤمنة؟',
        answer_ar: 'هل بياناتي مؤمنة؟هل بياناتي مؤمنة؟هل بياناتي مؤمنة؟هل بياناتي مؤمنة؟هل بياناتي مؤمنة؟',
        question_ur: 'کیا میری تفصیلات محفوظ ہیں؟',
        answer_ur:
          'کیا میری تفصیلات محفوظ ہیں؟کیا میری تفصیلات محفوظ ہیں؟کیا میری تفصیلات محفوظ ہیں؟کیا میری تفصیلات محفوظ ہیں؟',
      },
      {
        uuid: uuidv4(),
        question_en: 'How can i make refund from your website?',
        answer_en:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Scelerisque eleifend donec pretium vulputate sapien nec sagittis. Proin libero nunc consequat interdum.Condimentum lacinia quis vel eros donec ac',
        question_ar: 'كيف يمكنني استرداد الأموال من موقع الويب الخاص بك',
        answer_ar: 'كيف يمكنني استرداد الأموال من موقع الويب الخاص بككيف يمكنني استرداد الأموال من موقع الويب الخاص بك',
        question_ur: 'میں آپ کی ویب سائٹ سے رقم کی واپسی کیسے کر سکتا ہوں۔',
        answer_ur:
          'میں آپ کی ویب سائٹ سے رقم کی واپسی کیسے کر سکتا ہوں۔میں آپ کی ویب سائٹ سے رقم کی واپسی کیسے کر سکتا ہوں۔میں آپ کی ویب سائٹ سے رقم کی واپسی کیسے کر سکتا ہوں۔',
      },
    ]);
  },
};

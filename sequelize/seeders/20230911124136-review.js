'use strict';

/** @type {import('sequelize-cli').Migration} */
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('cms_review', [
      {
        uuid: uuidv4(),
        rating: 4,
        card_description_en:
          'Praesentium ipsam modi nostrum, quibusdam voluptas minus qui quas dicta consequuntur placeat animi cumque.',
        customer_name_en: 'John Deo',
        customer_designation_en: 'CEO',
        card_description_ur:
          'ہمارے موجودہ انداز میں، جو کچھ کہا گیا ہے اس پر عمل کرنے والوں کی خوشنودی دل کو کم تر ہوتی ہے۔',
        customer_name_ur: 'جان ڈیو',
        customer_designation_ur: 'سی ای او',
        card_description_ar: 'بالنسبة لأسلوبنا الحالي، فإن متعة بعض الذين يتبعون ما قيل أقل إرضاءً للعقل.',
        customer_name_ar: 'جون ديو',
        customer_designation_ar: 'المدير التنفيذي',
        profile_image: '1694685922070_reviewer_1.png',
      },
      {
        uuid: uuidv4(),
        rating: 4,
        card_description_en:
          'Praesentium ipsam modi nostrum, quibusdam voluptas minus qui quas dicta consequuntur placeat animi cumque.',
        customer_name_en: 'Albert Flores',
        customer_designation_en: 'CEO',
        card_description_ur:
          'ہمارے موجودہ انداز میں، جو کچھ کہا گیا ہے اس پر عمل کرنے والوں کی خوشنودی دل کو کم تر ہوتی ہے۔',
        customer_name_ur: 'جان ڈیو',
        customer_designation_ur: 'سی ای او',
        card_description_ar: 'بالنسبة لأسلوبنا الحالي، فإن متعة بعض الذين يتبعون ما قيل أقل إرضاءً للعقل.',
        customer_name_ar: 'جون ديو',
        customer_designation_ar: 'المدير التنفيذي',
        profile_image: '1694685977250_reviewer_2.png',
      },
      {
        uuid: uuidv4(),
        rating: 4,
        card_description_en:
          'Praesentium ipsam modi nostrum, quibusdam voluptas minus qui quas dicta consequuntur placeat animi cumque.',
        customer_name_en: 'Marvin McKinny',
        customer_designation_en: 'Manager',
        card_description_ur:
          'ہمارے موجودہ انداز میں، جو کچھ کہا گیا ہے اس پر عمل کرنے والوں کی خوشنودی دل کو کم تر ہوتی ہے۔',
        customer_name_ur: 'جان ڈیو',
        customer_designation_ur: 'سی ای او',
        card_description_ar: 'بالنسبة لأسلوبنا الحالي، فإن متعة بعض الذين يتبعون ما قيل أقل إرضاءً للعقل.',
        customer_name_ar: 'جون ديو',
        customer_designation_ar: 'المدير التنفيذي',
        profile_image: '1694686007523_reviewer_3.png',
      },
      {
        uuid: uuidv4(),
        rating: 4,
        card_description_en:
          'Praesentium ipsam modi nostrum, quibusdam voluptas minus qui quas dicta consequuntur placeat animi cumque.',
        customer_name_en: 'Marvin McKinny',
        customer_designation_en: 'Manager',
        card_description_ur:
          'ہمارے موجودہ انداز میں، جو کچھ کہا گیا ہے اس پر عمل کرنے والوں کی خوشنودی دل کو کم تر ہوتی ہے۔',
        customer_name_ur: 'جان ڈیو',
        customer_designation_ur: 'سی ای او',
        card_description_ar: 'بالنسبة لأسلوبنا الحالي، فإن متعة بعض الذين يتبعون ما قيل أقل إرضاءً للعقل.',
        customer_name_ar: 'جون ديو',
        customer_designation_ar: 'المدير التنفيذي',
        profile_image: '1694686044035_reviewer_4.png',
      },
    ]);
  },
};

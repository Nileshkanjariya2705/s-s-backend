const joi = require('joi');
const langauge = 'en';

export const faqSchema = joi.object({
  faqHeading: joi.string().required().label('FAQ Heading is reading'),
  faqSubHeading: joi.string().optional(),
  faqImage: joi.array().items(
    joi.object({
      image: joi.optional(),
    }),
  ),
});

export const createFaqDetailSehema = joi
  .object({
    [`question_en`]: joi.string().required('question is required'),
    [`answer_en`]: joi.string().required('answer is required'),
    [`question_ar`]: joi.string().required('question is required'),
    [`answer_ar`]: joi.string().required('answer is required'),
    [`question_ur`]: joi.string().required('question is required'),
    [`answer_ur`]: joi.string().required('answer is required'),
    slug: joi.string().optional(),
  })
  .options({
    abortEarly: false,
  });

export const updateFaqDetailSehema = joi
  .object({
    uuid: joi.string().optional(),
    data: joi.object().keys({
      [`question_en`]: joi.string().required('question is required'),
      [`answer_en`]: joi.string().required('answer is required'),
      [`question_ar`]: joi.string().required('question is required'),
      [`answer_ar`]: joi.string().required('answer is required'),
      [`question_ur`]: joi.string().required('question is required'),
      [`answer_ur`]: joi.string().required('answer is required'),
      uuid: joi.string().optional(),
      slug: joi.string().optional(),
    }),
  })
  .options({
    abortEarly: false,
  });

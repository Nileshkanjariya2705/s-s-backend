const joi = require('joi');

export const contactSchema = joi.object({
  pageTitle: joi.string().required('Page Title  is required'),
  heading: joi.string().required('Heading  is required'),
  subHeding: joi.string(),
  subTitle1: joi.string().required('Sub Title is required'),
  subTitle2: joi.string().required('Sub Title is required'),
  subTitle3: joi.string().required('Sub Title is required'),
  title1: joi.string().required('Title is required'),
  title2: joi.string().required('Title is required'),
  supportTitle: joi.string().required('Title is required'),
  title3: joi.string().required('Title is required'),
  contact: joi.array().items(
    joi.object({
      image: joi.optional(),
    }),
  ),
});

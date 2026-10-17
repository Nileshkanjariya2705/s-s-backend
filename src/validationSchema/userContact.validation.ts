const joi = require('joi');

export const userContactSchema = joi
  .object({
    firstname: joi.string().required('firstname is required'),
    lastname: joi.string().required('lastname is required'),
    phone: joi.optional(),
    email: joi.string().email().required('email is required'),
    message: joi.string().required('message is required'),
  })
  .options({
    abortEarly: false,
  });

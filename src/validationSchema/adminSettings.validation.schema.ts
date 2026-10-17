const joi = require('joi');
export const adminSettingSchema = joi
  .object({
    vat_charge: joi.string().required('vatcharge is required'),
    replacement_days: joi.string().required('replacement days is required'),
  })
  .options({
    abortEarly: false,
  });

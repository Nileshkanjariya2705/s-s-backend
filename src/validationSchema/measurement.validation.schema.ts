const joi = require('joi');

export const measurementSchema = joi.object({
  status: joi.string().required('status is requierd'),
  unit_name: joi.string().required('unit name is requierd'),
  unit_short_name: joi.string().required('unit short name is requierd'),
  unit_name_ar: joi.string().required('unit name is requierd'),
  unit_short_name_ar: joi.string().required('unit short name is requierd'),
  unit_name_ur: joi.string().required('unit name is requierd'),
  unit_short_name_ur: joi.string().required('unit short name is requierd'),
});

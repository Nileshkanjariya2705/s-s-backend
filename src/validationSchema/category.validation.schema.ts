import joi from 'joi';

export const categorySchema = joi.object({
 status:joi.string().required(),
 name:joi.string().required(),
 name_ar:joi.string().required(),
 name_ur:joi.string().required(),
 icon: joi.alternatives().try(
    joi.optional(),
    joi.string().optional(),
    joi.array().items(
      joi.object({
        fileName: joi.optional(),
      }),
    ),
  ),
});

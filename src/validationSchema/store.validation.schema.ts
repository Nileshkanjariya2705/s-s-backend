import joi from 'joi';

export const updateStoreData = joi.object({
  account_user_uuid: joi.string().optional(),
  iban_number: joi.string().required(),
  username: joi.string().required(),
  tax_number: joi.string().optional(),
  image: joi.alternatives().try(
    joi.optional(),
    joi.string().optional(),
    joi.array().items(
      joi.object({
        fileName: joi.optional(),
      }),
    ),
  ),
  phone: joi.alternatives().try(joi.optional(), joi.string().optional(), joi.number()),
  cr_number: joi.string().required(),
  company_name: joi.string().required(),
  email: joi.string().required(),
  addresses: joi.string().optional(),
  is_active: joi.boolean().required(),
});

export const deleteStoreData = joi.object({
  uuid: joi.string().required(),
});

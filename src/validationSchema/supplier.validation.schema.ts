import joi from 'joi';

export const updateSupplierData = joi.object({
  account_user_uuid: joi.string().optional(),
  iban_number: joi.string().required(),
  username: joi.string().required(),
  tax_number: joi.string().optional(),
  profile_image: joi.alternatives().try(
    joi.optional(),
    joi.string().optional(),
    joi.array().items(
      joi.object({
        fileName: joi.optional(),
      }),
    ),
  ),
  phone: joi.alternatives().try(joi.optional(), joi.string().optional()),
  cr_number: joi.string().required(),
  company_name: joi.string().required(),
  email: joi.string().required(),
  address: joi.string().optional(),
  is_active: joi.boolean().required(),
  is_verified: joi.boolean().optional(),
  ord_commission: joi.string().required(),
  bank_commission: joi.string().required(),
});

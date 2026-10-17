import Joi from 'joi';

import { joiCommon } from './common.validation';
export const userIncludeKey = ['organization', 'profile', 'platform'];

const joiData = {
  uuid: joiCommon.joiString.label('UUId'),

  password: joiCommon.joiString.label('password'),
  email: joiCommon.joiString
    .email({ ignoreLength: true })
    .max(100)
    .label('Email')
    .messages({ 'string.email': '{#label} must be a valid email' })
    .lowercase()
    .options({ convert: true }),
  company_name: joiCommon.joiString.label('company_name'),
  cr_number: joiCommon.joiString.label('cr_number'),
  tax_number: joiCommon.joiString.label('tax_number'),
  iban_number: joiCommon.joiString.label('iban_number'),
  username: joiCommon.joiString.label('username'),
  varient: joiCommon.joiString.label('varient'),
  remember: joiCommon.joiBoolean.label('remember'),
  confirm_password: joiCommon.joiString.label('confirm_password'),
  role: joiCommon.joiString.label('role'),
  phone: joiCommon.joiString.label('phone'),
  photo: joiCommon.joiObject.label('photo'),
  entity_uuid: joiCommon.joiString.label('entity_uuid'),
  address_uuid: joiCommon.joiString.label('entity_uuid'),
  reCAPTCHAtoken: joiCommon.joiString.label('reCAPTCHAtoken'),
};

export const createAccountSchema = Joi.object({
  ...joiData,
  email: joiData.email.required(),
  password: joiData.password.required(),
  company_name: joiData.company_name.required(),
  cr_number: joiData.cr_number.required(),
  tax_number: joiData.tax_number.allow('', null),
  varient: joiData.varient.uppercase(),
  username: joiData.username.required(),
  confirm_password: joiData.confirm_password.required(),
  reCAPTCHAtoken:joiData.reCAPTCHAtoken.optional(),
}).options({
  abortEarly: false,
});

export const loginSchema = Joi.object({
  ...joiData,
  username: joiData.username.optional(),
  password: joiData.password.required(),
  remember: joiData.remember.required(),
  reCAPTCHAtoken:joiData.reCAPTCHAtoken.optional(),
}).options({
  abortEarly: false,
});
export const updateAccountSchema = Joi.object({
  ...joiData,
  username: joiData.username.required(),
  email: joiData.email.required(),
  cr_number: joiData.cr_number.required(),
  company_name: joiData.company_name.required(),
  tax_number: joiData.tax_number.allow('', null),
  phone: joiData.phone.allow('', null),
  photo: Joi.alternatives().try(
    Joi.optional(),
    Joi.string().optional(),
    Joi.array().items(
      Joi.object({
        fileName: Joi.optional(),
      }),
    ),
  ),
  iban_number: joiData.iban_number.allow('', null),
}).options({
  abortEarly: false,
});
export const updatePasswordSchema = Joi.object({
  oldPassword: joiData.password.required(),
  password: joiData.password.required(),
});
export const updateAccountAdress = Joi.object({
  ...joiData,
  address_uuid: joiData.address_uuid.required(),
  uuid: joiData.address_uuid.optional(),
});
export const deleteAccountAdress = Joi.object({
  uuid: joiData.address_uuid.optional(),
});

export const createMember = Joi.object({
  ...joiData,
  username: joiData.username.required(),
  email: joiData.email.required(),
  password: joiData.password.required(),
  role: joiData.role.required(),
  phone: joiData.phone.required(),
  varient: joiData.varient.uppercase(),
  entity_uuid: joiData.entity_uuid.required(),
}).options({
  abortEarly: false,
});

export const adminPasswordUpdate = Joi.object({
  password: joiData.password.required(),
});

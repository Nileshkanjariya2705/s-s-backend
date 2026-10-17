import joi from 'joi';
import { joiCommon } from './common.validation';

const EnumType = { EXISTING: 'EXISTING', DIRECT: 'DIRECT' };
export const existingProductValidation = joi.object({
  quotes_accepted_upto: joi.string().required(),
  store_info_uuid: joi.string().required(),
  requester_uuid: joi.string().required(),
  purchase_request_mode: joi.string().valid(...Object.values(EnumType)),
  requested_price: joi.number().required(),
  quantity: joi.number().required(),
  supplier_product_uuid: joi.string().required(),
  supplier_uuid: joi.string().required(),
  notes: joi.optional(),
});

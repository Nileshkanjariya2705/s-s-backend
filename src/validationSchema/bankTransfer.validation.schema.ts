import joi from 'joi';

export const bankTransferValidation = joi.object({
  purchaseReqId: joi.string().required(),
  amount: joi.number().required(),
  orderId: joi.string().required(),
  supplier_info_uuid: joi.string().required(),
});

export const storeBankTransferListValidation = joi.object({
  store_info_uuid: joi.string().required(),
});

export const storeBankTransferViewValidation = joi.object({
  store_info_uuid: joi.string().required(),
  orderId: joi.string().required(),
});

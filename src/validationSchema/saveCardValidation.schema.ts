import joi from 'joi';

export const saveCardSchema = joi.object({
  card_name: joi.string().required(),
  customer_id: joi.string().required(),
  card_id: joi.string().required(),
  store_info_uuid: joi.string().required(),
});

export const getCardSchema = joi.object({
  store_info_uuid: joi.string().required(),
  apiParams: joi.object().required(),
});

export const retriveCard = joi.object({
  store_info_uuid: joi.string().required(),
});

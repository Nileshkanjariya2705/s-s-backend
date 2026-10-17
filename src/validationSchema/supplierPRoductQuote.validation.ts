import joi from 'joi';

export const supplierProductQuoteCreateSchema = joi.object({
  quoted_by: joi.string().required(),
  purchase_request_uuid: joi.string().required(),
  charges: joi.alternatives().try(joi.number().allow(null).optional(), joi.string().allow(null).optional()),
  product_details: joi.array().items(
    joi.object({
      purchase_request_products_uuid: joi.string().required(),
      offered_price: joi.string().required(),
      quantity: joi.string().required(),
      other_brand_product_uuid: joi.string().allow(null).optional(),
    }),
  ),
});

export const supplierProductQuoteUpdateSchema = joi.object({
  charges: joi.alternatives().try(joi.number().allow(null).optional(), joi.string().allow(null).optional()),
  supplier_quote_uuid: joi.string().required(),
  product_details: joi.array().items(
    joi.object({
      supplier_product_quote_uuid: joi.string().allow(null).required(),
      offered_price: joi.string().required().allow(null),
      quantity: joi.string().required(),
      other_brand_product_uuid: joi.string().allow(null).optional(),
      purchase_request_products_uuid: joi.string().optional(),
    }),
  ),
});

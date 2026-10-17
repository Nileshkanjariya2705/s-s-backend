import joi from 'joi';

export const OrderSchema = joi.object({
  created_by: joi.string().required(),
  supplier_id: joi.string().required(),
  purchase_request_uuid: joi.string().required(),
});

export const UpdateOrderProductSchema = joi.array().items(
  joi.object({
    product_name: joi.string().required(),
    product_image: joi.string().required(),
    price: joi.string().required(),
    quantity: joi.alternatives().try(joi.string().optional(), joi.number().optional()),
    order_product_id: joi.string().required(),
    order_id: joi.optional(),
  }),
);

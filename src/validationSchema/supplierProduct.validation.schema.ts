import joi from 'joi';

export const supplierProductSchema = joi.object({
  base_price: joi.string().allow(null).optional(),
  units: joi.alternatives().try(joi.string().required(), joi.number().required()),
  overview_en: joi.optional(),
  product: joi.string().required(),
  category: joi.string().required(),
  price: joi.string().required(),
  measurement: joi.optional(),
  description_en: joi.optional(),
  specification_en: joi.optional(),
  end_date: joi.date().required(),
  supplier_uuid: joi.string().optional(),
  user_entity_uuid: joi.string().optional(),
  is_purchaseable: joi.optional(),
  product_images: joi.alternatives().try(
    joi.array().items(joi.string()),
    joi.array().items(
      joi.object({
        fileName: joi.optional(),
      }),
    ),
    joi.string().optional(),
  ),
  status: joi.optional(),
  uuid: joi.optional(),
  charges: joi.alternatives().try(joi.number().allow(null).optional(), joi.string().allow(null).optional()),
});
export const supplierCategoryList = joi.object({
  category_uuid: joi.string().optional(),
  language: joi.string().optional(),
});


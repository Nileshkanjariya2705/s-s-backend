import joi from 'joi';

export const PurchaseRequestSchema = joi.object({
  additional_notes: joi.optional(),
  request_expiry: joi.string().required(),
  sub_total: joi.string().required(),
  requested_price: joi.string().required(),
  quantity: joi.string().required(),
  supplier_product_uuid: joi.string().required(),
  store_uuid: joi.string().required(),
  status: joi.string().required(),
});

export const createDirectPurchaseReqSchema = joi.object({
  product_details: joi
    .array()
    .items(
      joi.object({
        category: joi.string().guid().required(),
        description: joi.string().required(),
        other_brands_allowed: joi.boolean().required(),
        product: joi.string().guid().required(),
        quantity: joi.string().required(),
        requested_price: joi.string().required(),
        subtotal: joi.string().required(),
        unit_of_measurement: joi.string().required(),
      }),
    )
    .required(),
    address_uuid:joi.string().required(),
  requester_uuid: joi.string().required(),
  offer_for_entire_request: joi.boolean().required(),
  store_info_uuid: joi.string().optional(),
  expiry_date: joi.string().required(),
});

export const updateDirectPurchaseReqSchema = joi.object({
  product_details: joi
    .array()
    .items(
      joi.object({
        category: joi.string().guid().required(),
        description: joi.string().required(),
        other_brands_allowed: joi.boolean().required(),
        product: joi.string().guid().required(),
        quantity: joi.string().required(),
        requested_price: joi.string().required(),
        subtotal: joi.string().required(),
        unit_of_measurement: joi.string().required(),
        uuid: joi.string().optional(),
        image: joi.string().optional(),
      }),
    )
    .optional(),
  removAbleuuid: joi.array().optional(),
  address_uuid: joi.string().required(),
  purchase_request: joi.string().required(),
  is_existing_req: joi.boolean().optional(),
  requester_uuid: joi.string().required(),
  offer_for_entire_request: joi.boolean().required(),
  store_info_uuid: joi.string().optional(),
  expiry_date: joi.string().required(),
});

export const existingPurchaseRequestSchema = joi.object({
  category_uuid: joi.string().required(),
  description: joi.string().required(),
  product_uuid: joi.string().required(),
  quantity: joi.string().required(),
  quotes_accepted_upto: joi.string().required(),
  requested_price: joi.string().required(),
  requester_uuid: joi.string().required(),
  store_info_uuid: joi.string().required(),
  supplier_uuid: joi.string().required(),
});

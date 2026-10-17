import joi from 'joi';

export const addReviewSchema = joi.object({
  purchaseReqId: joi.string().required(),
  reviews: joi.optional().allow(null),
  supplier_info_uuid: joi.string().required(),
  rating: joi.number().optional(),
  orderId: joi.string().optional().allow(null),
});

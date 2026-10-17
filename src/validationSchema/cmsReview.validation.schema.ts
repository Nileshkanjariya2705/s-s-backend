import joi from 'joi';

export const cmsReviewCreateSchema = joi.object({
  rating: joi.string().required(),
  customer_name_en: joi.optional(),
  customer_designation_en: joi.optional(),
  card_description_en: joi.optional(),
  customer_name_ar: joi.optional(),
  customer_designation_ar: joi.optional(),
  card_description_ar: joi.optional(),
  customer_name_ur: joi.optional(),
  customer_designation_ur: joi.optional(),
  card_description_ur: joi.optional(),
  profile_image: joi.alternatives().try(
    joi.string().optional(),
    joi.array().items(
      joi.object({
        fileName: joi.optional(),
      }),
    ),
  ),
  uuid: joi.string().optional(),
});

export const cmsReviewDeleteSchema = joi.object({
  reviewId: joi.string().optional(),
});

export const cmsGetSingleReviewSchema = joi.object({
  uuid: joi.string().optional(),
});

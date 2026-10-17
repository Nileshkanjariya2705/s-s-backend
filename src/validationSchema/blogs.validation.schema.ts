const joi = require('joi');
const langauge = 'en';
export const createBlogSchema = joi
  .object({
    [`title_en`]: joi.string().required(),
    [`body_en`]: joi.string().required(),
    [`author_name_en`]: joi.string().required(),
    [`title_ar`]: joi.string().required(),
    [`body_ar`]: joi.string().required(),
    [`author_name_ar`]: joi.string().required(),
    [`title_ur`]: joi.string().required(),
    [`body_ur`]: joi.string().required(),
    [`author_name_ur`]: joi.string().required(),
    slug: joi.string().required(),
    author_image: joi.alternatives().try(
      joi.string().optional(),
      joi.array().items(
        joi.object({
          fileName: joi.optional(),
        }),
      ),
    ),
    cover_image: joi.alternatives().try(
      joi.string().optional(),
      joi.array().items(
        joi.object({
          fileName: joi.optional(),
        }),
      ),
    ),
    uuid: joi.string().optional(),
    created_at: joi.string().optional(),
  })
  .options({
    abortEarly: false,
  });
export const createBlogHeaderSchema = joi
  .object({
    page_banner: joi.required(),
    blogData: joi.array().items(
      joi.object({
        description: joi.optional(),
        heading: joi.optional(),
        page: joi.required(),
      }),
    ),
  })
  .options({
    abortEarly: false,
  });

export const deleteBlogSchema = joi.object({
  uuid: joi.string().optional(),
});
export const getSingleBlogSchema = joi.object({
  langauge: joi.string().optional(),
  slug: joi.string().optional(),
  uuid: joi.string().optional(),
});

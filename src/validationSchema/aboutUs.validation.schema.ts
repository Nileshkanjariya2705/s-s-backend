import joi from 'joi';

export const aboutUsValidation = joi.object({
  choose_us_card: joi.array().items(
    joi.object({
      image: joi.optional(),
      header: joi.optional(),
      description: joi.optional(),
    }),
  ),
  banner_section_img: joi.array().items(
    joi.object({
      image: joi.optional(),
    }),
  ),
  choose_us_header: joi.string().required(),
  choose_us_description: joi.string().required(),
  banner_section_heading: joi.string().required(),
  banner_section_subheading: joi.string().required(),
  button_text: joi.string().required(),
  banner_section_collections: joi.array().required(),
  our_team_description: joi.string().required(),
  our_team_header: joi.string().required(),
  our_team: joi.array().items(
    joi.object({
      image: joi.optional(),
      name: joi.optional(),
      position: joi.optional(),
    }),
  ),
  about_page_banner: joi.string().required(),
});

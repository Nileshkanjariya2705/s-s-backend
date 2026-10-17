const joi = require('joi');

export const homeSchema = joi.object({
  heading: joi.string().required().label('Banner Heading is reading'),
  subheding: joi.string().required().label('Banner sub Heading is reading'),
  bannerButtonText1: joi.string().required('Button text  is required'),
  bannerButtonText2: joi.string().required('Button text  is required'),
  Collection1: joi.string().required('Collection  is required'),
  Collection2: joi.string().required('Collection  is required'),
  FooterIcon1: joi.string().required('Footer icon text  is required'),
  FooterIcon2: joi.string().required('Footer icon text  is required'),
  FooterIcon3: joi.string().required('Footer icon text  is required'),
  FooterIcon4: joi.string().required('Footer icon text  is required'),
  productsCount: joi.string().required('Product count is required'),
  banner_section_img: joi.array().items(
    joi.object({
      fileName: joi.optional(),
    }),
  ),

  catHeading: joi.string().required('Category heading  is required'),
  catSubheding: joi.string().optional(),
  category: joi.array().items(
    joi.object({
      text: joi.string().required('category Text is required'),
      name: joi.optional(),
      image: joi.optional(),
    }),
  ),

  communityHeading: joi.string().required('Community heading  is required'),
  communitySubheding: joi.optional(),
  CommTitle1: joi.string().required('Title  is required'),
  ComSubheading1: joi.string().optional(),
  commButtonText1: joi.string().required('Button text  is required'),
  commButtonText2: joi.string().required('Button text  is required'),
  CommTitle2: joi.string().required('Title  is required'),
  ComSubheading2: joi.string().optional(),
  community_network_img: joi.array().items(
    joi.object({
      fileName: joi.optional(),
    }),
  ),

  purchaseHeading: joi.string().required('Purchase heading  is required'),
  purchaseSubheding: joi.string().required('Purchase  sub heading  is required'),
  PurchaseButtonText: joi.string().required('Button text  is required'),
  purchase_section_img: joi.array().items(
    joi.object({
      fileName: joi.optional(),
    }),
  ),

  imageHeading1: joi.string().required('Image heading  is required'),
  imageSubheading1: joi.string().optional(),
  imageHeading2: joi.string().required('Image heading  is required'),
  imageSubheading2: joi.string().optional(),
  dynamic_section_img: joi.array().items(
    joi.object({
      fileName: joi.optional(),
    }),
  ),

  featuredHeading: joi.string().required('Feature heading  is required'),
  featuredSubheding: joi.string().optional(),
  featured_products: joi.array().items(
    joi.object({
      image: joi.optional(),
      end_date: joi.string().required('Date is required'),
      title: joi.string().required('Product title required'),
      subTitle: joi.string().required('Product sub title is required'),
      price: joi.number().required('Product price is required'),
      rating: joi.string().optional(),
      featuredButtonText: joi.string().required('Product button text is required'),
      featuredButtonLink: joi.string().required('Product button link is required'),
    }),
  ),

  offerHeading: joi.string().required('Offer heading  is required'),
  offerSubheding: joi.string().optional(),
  offerTitle1: joi.string().required('Title  is required'),
  offerDescription1: joi.string().required('Description  is required'),
  offerTitle2: joi.string().required('Title  is required'),
  offerDescription2: joi.string().required('Description  is required'),
  offerTitle3: joi.string().required('Title  is required'),
  offerDescription3: joi.string().required('Description  is required'),
});

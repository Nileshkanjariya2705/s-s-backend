import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';

import validationMiddleware from '@/middlewares/validation.middleware';
import { verifyToken } from '@/helper/auth.helper';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import { CmsPagesController } from '@/controllers/Cms/cmsPages.controller';
import { userContactSchema } from '@/validationSchema/userContact.validation';
import UserContactRepo from '@/repository/Cms/userContact.repository';
import CmsPagesRepo from '@/repository/Cms/cmsPages.repository';
import BlogsDetailsRepo from '@/repository/Cms/blogDetails.repository';
import CmsReviewRepo from '@/repository/Cms/cmsReview.repository';
import { aboutUsValidation } from '@/validationSchema/aboutUs.validation.schema';
import { contactSchema } from '@/validationSchema/contact.validation';
import { homeSchema } from '@/validationSchema/home.validation';
import FaqRepo from '@/repository/Cms/faq.repository';
import CategoryRepo from '@/repository/Category/category.repository';

class CmsRoute implements Routes {
  public path = '/cms';
  public router = Router();
  public cmsPagesController = new CmsPagesController(
    new CmsPagesRepo(),
    new UserContactRepo(),
    new BlogsDetailsRepo(),
    new CmsReviewRepo(),
    new FaqRepo(),
    new CategoryRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/getPages`).get(this.cmsPagesController.getCmsPages);
    this.router.route(`${this.path}/data-source-count`).get(this.cmsPagesController.getDataSourceCount);
    this.router.route(`${this.path}/getSpecificPage`).get(this.cmsPagesController.getSpecificPage);
    this.router.route(`${this.path}/updateReviewPage`).post(this.cmsPagesController.updateReviewPage);
    this.router.route(`${this.path}/updateSpecificPage`).post(
      verifyToken,
      uploadMedia.fields([
        { name: 'banner_section_img', maxCount: 10 },
        { name: 'community_network_img', maxCount: 20 },
        { name: 'dynamic_section_img', maxCount: 10 },
        { name: 'purchase_section_img', maxCount: 10 },
        { name: 'featured_products', maxCount: 10 },
      ]),
      (req, res, next) => {
        let key = Object.keys(req.body)[0];
        const requestedContent = JSON.parse(req.body[key]);
        const { error } = homeSchema.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      this.cmsPagesController.updateHomePage,
    );

    this.router.route(`${this.path}/about-us`).post(
      uploadMedia.fields([
        { name: 'banner_section_img', maxCount: 10 },
        { name: 'our_team', maxCount: 10 },
        { name: 'choose_us_card', maxCount: 10 },
      ]),
      (req, res, next) => {
        let key = Object.keys(req.body)[0];
        const requestedContent = JSON.parse(req.body[key]);
        const { error } = aboutUsValidation.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      verifyToken,
      this.cmsPagesController.updatedAboutUsCms,
    );
    this.router.route(`${this.path}/`).post(verifyToken, this.cmsPagesController.updatedAboutUsCms);
    this.router.route(`/get/cms-page`).get(this.cmsPagesController.getCmsPage);
    this.router.route(`${this.path}/contact-us`).post(
      uploadMedia?.fields([{ name: 'contact', maxCount: 10 }]),
      (req, res, next) => {
        let key = Object.keys(req.body)[0];
        const requestedContent = JSON.parse(req.body[key]);
        const { error } = contactSchema.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      this.cmsPagesController.updateContactPage,
    );

    this.router
      .route(`${this.path}/getInTouch`)
      .post(validationMiddleware(userContactSchema, 'body'), this.cmsPagesController.createUserContact);

    this.router.route(`/about/blog-list`).post(this.cmsPagesController.getAboutUsBlogs);
    this.router.route(`/home/blog-list`).post(this.cmsPagesController.getHomePageBlogs);
    this.router.route(`/contact/blog-list`).post(this.cmsPagesController.getContactPageBlogs);
    this.router.route(`/about/reviews`).post(this.cmsPagesController.getAboutUsReviews);
    this.router.route(`/home/reviews`).post(this.cmsPagesController.getHomePageReviews);
    this.router
      .route(`${this.path}/getSingleCategory/:categoryId`)
      .get(verifyToken, this.cmsPagesController.getSingleCategory);
    this.router.route(`${this.path}/getCategory`).get(verifyToken, this.cmsPagesController.getAllCategories);
    this.router.route(`${this.path}/getInTouchData`).get(verifyToken, this.cmsPagesController.getUserContact);
    this.router
      .route(`${this.path}/getInTouch/:userContactId`)
      .get(verifyToken, this.cmsPagesController.getSingleUserContact);
    this.router
      .route(`${this.path}/deleteContact/:userContactId`)
      .delete(verifyToken, this.cmsPagesController.deleteUserContact);
  }
}
export default CmsRoute;

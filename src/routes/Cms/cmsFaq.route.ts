import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import { CmsFaqController } from '@/controllers/Cms/cmsFaq.controller';
import CmsPagesRepo from '@/repository/Cms/cmsPages.repository';
import FaqRepo from '@/repository/Cms/faq.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { createFaqDetailSehema, faqSchema, updateFaqDetailSehema } from '@/validationSchema/faq.validation';
import { verifyToken } from '@/helper/auth.helper';

class CmsFaqRoute implements Routes {
  public path = '/cms-faq';
  public router = Router();
  public cmsFaqController = new CmsFaqController(new CmsPagesRepo(), new FaqRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}`).post(
      verifyToken,
      uploadMedia?.fields([{ name: 'faqImage', maxCount: 10 }]),
      (req, res, next) => {
        let key = Object.keys(req.body)[0];
        const requestedContent = JSON.parse(req.body[key]);
        const { error } = faqSchema.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      this.cmsFaqController.updateFaqPage,
    );
    this.router
      .route(`${this.path}/create`)
      .post(verifyToken, validationMiddleware(createFaqDetailSehema, 'body'), this.cmsFaqController.createFaq);
    this.router.route(`${this.path}/getFaq`).get(this.cmsFaqController.getFaqDetail);
    this.router.route(`${this.path}/get`).post(verifyToken, this.cmsFaqController.getSpecificFaq);
    this.router
      .route(`${this.path}/updateFaq`)
      .post(verifyToken, validationMiddleware(updateFaqDetailSehema, 'body'), this.cmsFaqController.updateFaq);
    this.router.route(`${this.path}/delete/:uuid`).delete(verifyToken, this.cmsFaqController.deleteFaq);
  }
}

export default CmsFaqRoute;

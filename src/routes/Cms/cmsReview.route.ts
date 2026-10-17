import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import { CmsReviewController } from '@/controllers/Cms/cmsReview.controller';

import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import CmsReviewRepo from '@/repository/Cms/cmsReview.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  cmsGetSingleReviewSchema,
  cmsReviewCreateSchema,
  cmsReviewDeleteSchema,
} from '@/validationSchema/cmsReview.validation.schema';

class CmsReviewRoute implements Routes {
  public path = '/cms-review';
  public router = Router();
  public cmsReviewController = new CmsReviewController(new CmsReviewRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(
        uploadMedia.single('profile_image'),
        validationMiddleware(cmsReviewCreateSchema, 'body'),
        this.cmsReviewController.createReview,
      );
    this.router.route(`${this.path}`).get(this.cmsReviewController.getAllReviews);
    this.router
      .route(`${this.path}/singleReview`)
      .post(validationMiddleware(cmsGetSingleReviewSchema, 'body'), this.cmsReviewController.getSingleReview);
    this.router
      .route(`${this.path}/delete`)
      .post(validationMiddleware(cmsReviewDeleteSchema, 'body'), this.cmsReviewController.deleteReview);
    this.router
      .route(`${this.path}/update`)
      .post(
        uploadMedia.single('profile_image'),
        validationMiddleware(cmsReviewCreateSchema, 'body'),
        this.cmsReviewController.updateReview,
      );
  }
}

export default CmsReviewRoute;

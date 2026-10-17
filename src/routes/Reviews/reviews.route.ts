import { ReviewsController } from '@/controllers/Reviews/reviews.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import ReviewsRepository from '@/repository/Reviews/reviews.repository';
import { addReviewSchema } from '@/validationSchema/reviews.validation.schema';

import { Router } from 'express';

class ReviewsRoute implements Routes {
  public path = '/reviews';
  public router = Router();

  public reviewsController = new ReviewsController(new ReviewsRepository());
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router
      .route(`/add-reviews`)
      .post(verifyToken, validationMiddleware(addReviewSchema, 'body'), this.reviewsController.getReviewsAndRating);
  }
}
export default ReviewsRoute;

import { StoreProductReviewsController } from '@/controllers/StoreProductReviews/storeProductReviews.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import StoreProductReviewsRepository from '@/repository/StoreProductReviews/storeProductReviews.repository';
import { Router } from 'express';

class StoreProductReviewsRoute implements Routes {
  public path = '/storeProductReviews';
  public router = Router();

  public storeProductReviewsController = new StoreProductReviewsController(new StoreProductReviewsRepository());
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.route(`${this.path}/add`).post(verifyToken, this.storeProductReviewsController.addStoreProductReviews);
    this.router.route(`${this.path}/getAll`).get(verifyToken, this.storeProductReviewsController.getReviewRating);
    this.router
      .route(`${this.path}/getSingle`)
      .get(verifyToken, this.storeProductReviewsController.getSingleReviewRating);
  }
}
export default StoreProductReviewsRoute;

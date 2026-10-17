import { PurchaseHistoryController } from '@/controllers/PurchaseHistory/purchaseHistory.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import ReviewsRepository from '@/repository/Reviews/reviews.repository';
import { Router } from 'express';

class PurchaseHistoryRoute implements Routes {
  public path = '/purchase-history';
  public router = Router();
  public purchaseHistoryContoller = new PurchaseHistoryController(
    new PaymentDetailsRepo(),
    new OrderProductsRepo(),
    new ReviewsRepository(),
  );

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.route(`${this.path}/fetch-all`).get(verifyToken, this.purchaseHistoryContoller.getAllHistory);
    this.router.route(`${this.path}`).get(verifyToken, this.purchaseHistoryContoller.getSinglePurchaseRequestHistory);
    this.router.route(`${this.path}/orderCount`).get(verifyToken,this.purchaseHistoryContoller.getCount)
  }
}

export default PurchaseHistoryRoute;

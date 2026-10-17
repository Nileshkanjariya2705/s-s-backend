import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import OrderRepo from '@/repository/Orders/order.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import { OrderProductController } from '@/controllers/OrderProducts/orderProducts.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { UpdateOrderProductSchema } from '@/validationSchema/order.validation.schema';
import { verifyToken } from '@/helper/auth.helper';
import { OrderReplacementController } from '@/controllers/OrderReplacement/OrderReplacement.controller';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import ReplacementRequestRepository from '@/repository/ReplacementRequest/replacementRequest.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';

class OrderReplacementRoute implements Routes {
  public path = '/replacement';
  public router = Router();
  public OrderReplacementController = new OrderReplacementController(
    new OrderRepo(),
    new OrderProductsRepo(),
    new PaymentDetailsRepo(),
    new ReplacementRequestRepository(),
    new NotificationRepo(),
    new AccountUsersRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(verifyToken, this.OrderReplacementController.createReplacementRequest);
    this.router
      .route(`${this.path}/get-replacement`)
      .get(verifyToken, this.OrderReplacementController.getReplacementProducts);
    this.router
      .route(`${this.path}/updateReqStatus`)
      .post(verifyToken, this.OrderReplacementController.createReplacementProducts);
    this.router.route(`${this.path}/get`).get(verifyToken, this.OrderReplacementController.getReplacementReq);
    this.router.route(`${this.path}/updateRefundReqStatus`);
  }
}

export default OrderReplacementRoute;

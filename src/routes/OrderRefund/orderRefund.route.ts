import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import OrderRepo from '@/repository/Orders/order.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import { verifyToken } from '@/helper/auth.helper';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import { OrderRefundController } from '@/controllers/OrderRefund/OrderRefund.controller';
import RefundOrdersRepo from '@/repository/RefundOrders/refundOrders.repository';

class OrderRefundRoute implements Routes {
  public path = '/refund';
  public router = Router();
  public OrderRefundController = new OrderRefundController(
    new OrderRepo(),
    new OrderProductsRepo(),
    new RefundOrdersRepo(),
    new PaymentDetailsRepo(),
    new NotificationRepo(),
    new AccountUsersRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }
  
  private initializeRoutes() {
    this.router.route(`${this.path}/create`).post(verifyToken, this.OrderRefundController.createRefundRequest);
    this.router.route(`${this.path}/get-refund`).get(verifyToken,this.OrderRefundController.getRefundProducts);
    this.router
      .route(`${this.path}/updateRefundReqStatus`)
      .post(verifyToken, this.OrderRefundController.createRefundProducts);
    this.router.route(`${this.path}/get`).get(verifyToken,this.OrderRefundController.getRefundRequest);
  }
}

export default OrderRefundRoute;

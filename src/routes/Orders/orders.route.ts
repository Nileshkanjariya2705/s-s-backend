import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { OrderController } from '@/controllers/Orders/order.controller';
import OrderRepo from '@/repository/Orders/order.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { OrderSchema } from '@/validationSchema/order.validation.schema';
import { verifyToken } from '@/helper/auth.helper';
import NotificationRepo from '@/repository/Notification/notification.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';

class OrderRoute implements Routes {
  public path = '/orders';
  public router = Router();
  public orderController = new OrderController(
    new OrderRepo(),
    new PurchaseRequestRepo(),
    new NotificationRepo(),
    new AccountUsersRepo(),
    new NotificationRecieverRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(verifyToken, validationMiddleware(OrderSchema, 'body'), this.orderController.orderCreate);
    this.router.route(`${this.path}/update`).post(verifyToken, this.orderController.orderUpdate);
    this.router.route(`${this.path}/vat-charges`).get(verifyToken, this.orderController.getVatCharge);
    this.router.route(`${this.path}/getAll`).get(verifyToken, this.orderController.getAllOrder);
    this.router.route(`${this.path}/getAddress`).get(verifyToken, this.orderController.getAddress);
    this.router.route(`${this.path}/updateStatus/:orderId`).post(verifyToken, this.orderController.updateStatus);
    this.router
      .route(`${this.path}/updateReplaceStatus/:orderId`)
      .post(verifyToken, this.orderController.updateReplaceStatus);
    this.router.route(`${this.path}/cancel/:orderId`).post(verifyToken, this.orderController.addCancelReason);
    this.router.route(`${this.path}/admin-refund-status`).post(verifyToken, this.orderController.adminRefundOrder);
    this.router.route(`${this.path}/supplier-data`).post(verifyToken,this.orderController.supplierSalesSummary);
    this.router.route(`${this.path}/supplier-some`).post(this.orderController.generateStatistic);

  }
}

export default OrderRoute;

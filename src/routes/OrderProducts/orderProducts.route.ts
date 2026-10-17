import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import OrderRepo from '@/repository/Orders/order.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import { OrderProductController } from '@/controllers/OrderProducts/orderProducts.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { UpdateOrderProductSchema } from '@/validationSchema/order.validation.schema';
import { verifyToken } from '@/helper/auth.helper';

class OrderProductRoute implements Routes {
  public path = '/order-products';
  public router = Router();
  public orderProductController = new OrderProductController(new OrderRepo(), new OrderProductsRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/get`).get(verifyToken, this.orderProductController.getParticularOrder);
    this.router.route(`${this.path}/update`).post(
      verifyToken,
      // validationMiddleware(UpdateOrderProductSchema, 'body'),
      this.orderProductController.orderProductUpdate,
    );
    this.router
      .route(`${this.path}/delete/:orderProductId`)
      .delete(verifyToken, this.orderProductController.deleteOrderProduct);
    this.router.route(`${this.path}/updateReqStatus/:uuid`).post(this.orderProductController.updateReqStatus);
  }
}

export default OrderProductRoute;

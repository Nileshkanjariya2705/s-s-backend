import { PurchaseRequestProductsController } from '@/controllers/PurchaseRequestProducts/purchaseRequestProducts.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import PurchaseRequestProductsRepo from '@/repository/PurchaseRequestProducts/purchaseRequestProducts.repository';
import SupplierProductQuotesRepo from '@/repository/SupplierProductQuotes/supplierProductQuotes.repository';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import {
  createDirectPurchaseReqSchema,
  existingPurchaseRequestSchema,
  updateDirectPurchaseReqSchema,
} from '@/validationSchema/PurchaseRequest.schema';
import { Router } from 'express';

class PurchaseRequestProductsRoutes implements Routes {
  public path = '/purchase-request-products';
  public router = Router();

  public purchaseRequestProductsController = new PurchaseRequestProductsController(
    new PurchaseRequestRepo(),
    new PurchaseRequestProductsRepo(),
    new SupplierQuotesRepo(),
    new SupplierProductQuotesRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
    new AccountUsersRepo(),
  );
  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.route(`${this.path}/get`).get(this.purchaseRequestProductsController.purchaseRequestProductGet);
    this.router
      .route(`/direct-purchase-request`)
      .post(
        verifyToken,
        validationMiddleware(createDirectPurchaseReqSchema, 'body'),
        this.purchaseRequestProductsController.createDirectPurchaseReqByStore,
      );

    this.router
      .route(`/update-purchase-request`)
      .post(
        verifyToken,
        validationMiddleware(updateDirectPurchaseReqSchema, 'body'),
        this.purchaseRequestProductsController.updateAndInsertProductReq,
      );

    this.router.route(`${this.path}/rejectSuppQuote`).get(this.purchaseRequestProductsController.rejectSupplierQuote);

    this.router
      .route(`/existing-purchase-request`)
      .post(
        verifyToken,
        validationMiddleware(existingPurchaseRequestSchema, 'body'),
        this.purchaseRequestProductsController.createExistingPurchaseReqByStore,
      );
  }
}

export default PurchaseRequestProductsRoutes;

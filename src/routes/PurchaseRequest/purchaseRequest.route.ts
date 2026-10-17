import { PurchaseRequestController } from '@/controllers/PurchaseRequest/purchaseRequest.controller';
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
import { PurchaseRequestSchema } from '@/validationSchema/PurchaseRequest.schema';
import { Router } from 'express';

class PurchaseReqestRoute implements Routes {
  public path = '/purchase-request';
  public router = Router();

  public purchaseRequestController = new PurchaseRequestController(
    new PurchaseRequestRepo(),
    new PurchaseRequestProductsRepo(),
    new SupplierProductQuotesRepo(),
    new AccountUsersRepo(),
    new SupplierQuotesRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
  );
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(
        verifyToken,
        validationMiddleware(PurchaseRequestSchema, 'body'),
        this.purchaseRequestController.purchaseRequestCreate,
      );
    this.router.route(`/supplier${this.path}`).get(verifyToken, this.purchaseRequestController.getAllPurchaseRequest);
    this.router
      .route(`${this.path}/get-single-request/:purchase_request_uuid`)
      .get(this.purchaseRequestController.getSinglePurchaseRequest);

    this.router.route(`${this.path}/expired`).post(this.purchaseRequestController.purchaseReqExpired);
    this.router.route(`${this.path}/completed`).get(verifyToken, this.purchaseRequestController.purchaseReqCompleted);
    this.router.route(`${this.path}/get`).get(verifyToken, this.purchaseRequestController.getpurchaseReq);
    this.router
      .route(`${this.path}/delete/:purchaseReqId`)
      .delete(this.purchaseRequestController.deletePurchaseRequest);

    this.router.route(`${this.path}/getAll`).get(verifyToken, this.purchaseRequestController.getStorePurchaseRequest);
    this.router
      .route(`/store/purchase-request`)
      .get(verifyToken, this.purchaseRequestController.getpurchaseReqForStore);

    this.router.route(`/direct-buy`).post(verifyToken, this.purchaseRequestController.directBuyNow);
  }
}

export default PurchaseReqestRoute;

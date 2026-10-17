import { SupplierProductQuotesController } from '@/controllers/SupplierProductQuotes/supplierProductQuotes.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import ProductsRepo from '@/repository/Products/products.repository';
import PurchaseRequestProductsRepo from '@/repository/PurchaseRequestProducts/purchaseRequestProducts.repository';
import SupplierProductQuotesRepo from '@/repository/SupplierProductQuotes/supplierProductQuotes.repository';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import {
  supplierProductQuoteCreateSchema,
  supplierProductQuoteUpdateSchema,
} from '@/validationSchema/supplierPRoductQuote.validation';
import { Router } from 'express';

class SupplierProductQuotesRoute implements Routes {
  public path = '/supplier-product-quotes';
  public router = Router();

  public supplierProductQuotesController = new SupplierProductQuotesController(
    new SupplierProductQuotesRepo(),
    new SupplierQuotesRepo(),
    new PurchaseRequestProductsRepo(),
    new ProductsRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
    new AccountUsersRepo(),
  );
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(
        verifyToken,
        validationMiddleware(supplierProductQuoteCreateSchema, 'body'),
        this.supplierProductQuotesController.supplierProductQuotesCreate,
      );

    this.router.route(`${this.path}/getProducts`).get(this.supplierProductQuotesController.getCategoryWiseProduct);

    this.router
      .route(`${this.path}/updateOtherBrandProduct`)
      .post(this.supplierProductQuotesController.updateOtherBrandProduct);

    this.router
      .route(`/supplier-product-quotes/update`)
      .post(
        verifyToken,
        validationMiddleware(supplierProductQuoteUpdateSchema, 'body'),
        this.supplierProductQuotesController.supplierProductQuotesUpdate,
      );
  }
}

export default SupplierProductQuotesRoute;

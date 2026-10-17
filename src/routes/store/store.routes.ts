import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import { storeInfoController } from '@/controllers/Store/store.controller';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import { deleteStoreData, updateStoreData } from '@/validationSchema/store.validation.schema';
import ProductsRepo from '@/repository/Products/products.repository';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import AccountRepo from '@/repository/Authentication/account.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import { verifyToken } from '@/helper/auth.helper';
import StoreProductReviewsRepository from '@/repository/StoreProductReviews/storeProductReviews.repository';
class StoreRoute implements Routes {
  public path = '/store';
  public router = Router();
  public storeController = new storeInfoController(
    new AccountUsersRepo(),
    new ProductsRepo(),
    new SupplierProductsRepo(),
    new PurchaseRequestRepo(),
    new AccountRepo(),
    new OrderRepo(),
    new PaymentDetailsRepo(),
    new StoreProductReviewsRepository(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}`).post(this.storeController.getSingleStoreInfo);
    this.router.route(`${this.path}/updateStoreInfo`).post(
      uploadMedia.single('image'),
      validationMiddleware(updateStoreData),
      this.storeController.updateStoreInfo,
    );

    this.router
      .route(`${this.path}/deleteStoreInfo`)
      .post(validationMiddleware(deleteStoreData), this.storeController.deleteStoreInfo);

    this.router.route(`${this.path}/productDetails`).get(this.storeController.getSingleProductDetail);
    this.router
      .route(`${this.path}/purchasedProduct`)
      .get(verifyToken, this.storeController.getPurchasedProductDetails);
    // this.router.route(`${this.path}/otherSupplierProduct`).get(this.storeController.getProductsForOtherSupplier);
  }
}

export default StoreRoute;

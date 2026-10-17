import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import { SupplierController } from '@/controllers/Supplier/supplier.controller';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import AccountRepo from '@/repository/Authentication/account.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { updateSupplierData } from '@/validationSchema/supplier.validation.schema';
import { verifyToken } from '@/helper/auth.helper';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';

class SupplierRoute implements Routes {
  public path = '/supplier';
  public router = Router();
  public supplierController = new SupplierController(
    new AccountUsersRepo(),
    new AccountRepo(),
    new SupplierInfoRepo(),
    new OrderRepo(),
    new PaymentDetailsRepo(),
    new SupplierQuotesRepo(),
    new PurchaseRequestRepo(),
    new SupplierProductsRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/supplierEdit`).post(this.supplierController.getSingleSupplier);
    this.router
      .route(`${this.path}/update`)
      .post(
        uploadMedia.single('profile_image'),
        validationMiddleware(updateSupplierData),
        this.supplierController.updateSupplier,
      );
    this.router.route(`${this.path}/delete/:uuid`).delete(verifyToken, this.supplierController.deleteSupplier);

      this.router.route(`${this.path}/suppDetail`).get(this.supplierController.getSuppDashboardDetails);
      this.router.route(`${this.path}/month-wise-data`).get(this.supplierController.getMonthlyFinanceData)
      this.router.route(`${this.path}/pdfData`).get(this.supplierController.getFinancePdfData)
      this.router.route(`${this.path}/finance-payment-approve`).post(this.supplierController.getFinanceApproved)
  }
}

export default SupplierRoute;

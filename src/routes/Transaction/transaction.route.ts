import { TransactionController } from '@/controllers/Transaction/transaction.controller';
import { Routes } from '@/interfaces/routes.interface';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import CategoryRepo from '@/repository/Category/category.repository';
import ProductsRepo from '@/repository/Products/products.repository';
import { Router } from 'express';

class TransactionRoute implements Routes {
  public path = '/admin-transaction';
  public router = Router();

  public transactionController = new TransactionController(
    new CategoryRepo(),
    new ProductsRepo(),
    new SupplierInfoRepo(),
  );
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}`).get(this.transactionController.getGeneralInfo);
  }
}

export default TransactionRoute;

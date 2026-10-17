import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { SupplierProductsController } from '@/controllers/SupplierProducts/supplierProducts.controller';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import CategoryRepo from '@/repository/Category/category.repository';
import { verifyToken } from '@/helper/auth.helper';
import ProductsRepo from '@/repository/Products/products.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { supplierCategoryList, supplierProductSchema } from '@/validationSchema/supplierProduct.validation.schema';

class SupplierProductsRoute implements Routes {
  public path = '/supplier-product';
  public router = Router();
  public supplierProductsController = new SupplierProductsController(
    new SupplierProductsRepo(),
    new CategoryRepo(),
    new ProductsRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/getCategory`).get(verifyToken, validationMiddleware(supplierCategoryList, 'query'), this.supplierProductsController.getAllCategories);
    this.router.route(`${this.path}/getProducts`).get(verifyToken, this.supplierProductsController.getAllProducts);

    this.router
      .route(`${this.path}/getSuppProducts`)
      .get(verifyToken, this.supplierProductsController.getAllSupplierProducts);
    this.router
      .route(`${this.path}/catWisePro/:categoryId`)
      .get(verifyToken, this.supplierProductsController.getCategoryWiseProduct);
    this.router
      .route(`${this.path}/add`)
      .post(
        verifyToken,
        validationMiddleware(supplierProductSchema, 'body'),
        this.supplierProductsController.supplierAddProduct,
      );
    this.router
      .route(`${this.path}/edit`)
      .post(
        verifyToken,
        validationMiddleware(supplierProductSchema, 'body'),
        this.supplierProductsController.supplierEditProduct,
      );
    this.router
      .route(`${this.path}/delete/:uuid`)
      .delete(verifyToken, this.supplierProductsController.supplierProductDelete);
    this.router.route(`${this.path}/get`).post(verifyToken, this.supplierProductsController.getSingleSupplierProduct);
    this.router
      .route(`${this.path}/getSingleProduct/:productId`)
      .get(verifyToken, this.supplierProductsController.getSingleProduct);
  }
}

export default SupplierProductsRoute;

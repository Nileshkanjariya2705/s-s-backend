import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { verifyToken } from '@/helper/auth.helper';
import { CategoryController } from '@/controllers/Category/category.controller';
import CategoryRepo from '@/repository/Category/category.repository';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import ProductsRepo from '@/repository/Products/products.repository';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { categorySchema } from '@/validationSchema/category.validation.schema';

class CategoryRoute implements Routes {
  public path = '/category';
  public router = Router();
  public categoryController = new CategoryController(
    new CategoryRepo(),
    new ProductsRepo(),
    new SupplierProductsRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(
        uploadMedia.single('icon'),
        verifyToken,
        validationMiddleware(categorySchema, 'body'),
        this.categoryController.createCategory,
      );
    this.router.route(`/get-all/category`).get(verifyToken, this.categoryController.getAllCategories);

    this.router
      .route(`/category/update/:categoryId`)
      .patch(
        uploadMedia.single('icon'),
        verifyToken,
        validationMiddleware(categorySchema, 'body'),
        this.categoryController.updateCategory,
      );

    this.router.route(`/get/category/:categoryId`).get(verifyToken, this.categoryController.getSpecificCategory);
    this.router.route(`${this.path}/delete/:categoryId`).delete(verifyToken, this.categoryController.deleteCategory);
    this.router.route(`${this.path}/listing`).get(verifyToken, this.categoryController.getAllCategoriesListing);
    this.router.route(`/product/category-wise`).get(verifyToken, this.categoryController.getAllProductsCategoryWise);
    this.router.route(`/category-wise-product`).post(this.categoryController.categoryWiseProduct);
    this.router.route(`${this.path}/all`).get(this.categoryController.getProducts);
  }
}

export default CategoryRoute;

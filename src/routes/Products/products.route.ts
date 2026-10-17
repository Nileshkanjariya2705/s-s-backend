import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { ProductsController } from '@/controllers/Products/products.controller';
import ProductsRepo from '@/repository/Products/products.repository';
import CategoryRepo from '@/repository/Category/category.repository';
import {  uploadMedia } from '@/middlewares/imageUpload.middleware';
import MeasurementRepo from '@/repository/Measurement/measurement.repository';

class ProductsRoute implements Routes {
  public path = '/product';
  public router = Router();
  public productsController = new ProductsController(new ProductsRepo(), new CategoryRepo(), new MeasurementRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}`).get(this.productsController.getAllProducts);
    this.router.route(`${this.path}/single-product/:uuid`).get(this.productsController.getSingleProduct);
    this.router
      .route(`${this.path}/create-product`)
      .post(uploadMedia.fields([{ name: 'product_image', maxCount: 5 }]), this.productsController.createProduct);
    this.router
      .route(`${this.path}/update-product`)
      .post(
        uploadMedia.fields([{ name: 'product_image', maxCount: 10 }]),
        this.productsController.updateProduct,
      );
    this.router.route(`${this.path}/delete-product/:uuid`).delete(this.productsController.deleteProduct);
    this.router.route(`${this.path}/getCategories`).get(this.productsController.getAllActiveCategory);
    this.router.route(`${this.path}/get-measurements`).get(this.productsController.getAllActiveMeasurements);
  }
}

export default ProductsRoute;

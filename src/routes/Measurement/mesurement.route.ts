import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { MeasurementController } from '@/controllers/Measurement/measurement.controller';
import MeasurementRepo from '@/repository/Measurement/measurement.repository';
import validationMiddleware from '@/middlewares/validation.middleware';
import { verifyToken } from '@/helper/auth.helper';
import { measurementSchema } from '@/validationSchema/measurement.validation.schema';
import ProductsRepo from '@/repository/Products/products.repository';

class MeasurementRoute implements Routes {
  public path = '/measurement';
  public router = Router();
  public measurementController = new MeasurementController(new MeasurementRepo(),new ProductsRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/add`)
      .post(verifyToken, validationMiddleware(measurementSchema, 'body'), this.measurementController.createUnit);
    this.router.route(`${this.path}/getAll`).get(verifyToken, this.measurementController.getAllUnits);
    this.router.route(`${this.path}/get`).post(verifyToken, this.measurementController.getSingleUnit);
    this.router.route(`${this.path}/delete/:uuid`).delete(verifyToken, this.measurementController.deleteUnit);
    this.router.route(`${this.path}/edit`).post(verifyToken, this.measurementController.updateUnit);
  }
}

export default MeasurementRoute;

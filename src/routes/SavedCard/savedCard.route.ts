import { SaveCardController } from '@/controllers/SaveCard/saveCard.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import validationMiddleware from '@/middlewares/validation.middleware';
import SaveCardRepo from '@/repository/SaveCard/saveCard.repository';
import { getCardSchema, saveCardSchema } from '@/validationSchema/saveCardValidation.schema';

import { Router } from 'express';

class SaveCardRoute implements Routes {
  public path = '/save-card';
  public router = Router();
  public saveCardController = new SaveCardController(new SaveCardRepo());

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router
      .route(`${this.path}`)
      .post(verifyToken, validationMiddleware(saveCardSchema, 'body'), this.saveCardController.createNewCard);
    this.router
      .route(`${this.path}/listing`)
      .get(verifyToken, validationMiddleware(getCardSchema, 'query'), this.saveCardController.getCardList);
    this.router.route(`${this.path}/delete/:id/:name`).delete(verifyToken, this.saveCardController.deleteCard);
    this.router.route(`/edit-card`).post(verifyToken, this.saveCardController.editCard);
  }
}
export default SaveCardRoute;

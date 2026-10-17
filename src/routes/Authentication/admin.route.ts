import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import { AdminAccountController } from '@/controllers/Authentication/adminAccount.controller';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import AccountRepo from '@/repository/Authentication/account.repository';
import { verifyToken } from '@/helper/auth.helper';
import validationMiddleware from '@/middlewares/validation.middleware';
import { loginSchema } from '@/validationSchema/account.validation.schema';

class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public adminAccountController = new AdminAccountController(new AccountUsersRepo(), new AccountRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route("/admin/login")
      .post(validationMiddleware(loginSchema, 'body'), this.adminAccountController.getAdminLoginDetails);
    this.router.route(`${this.path}/store-info`).get(this.adminAccountController.getStoreInfo);
    this.router.route(`${this.path}/forgot-password`).post(this.adminAccountController.adminForgotPassword);
    this.router
      .route(`${this.path}/change-password`)
        .post(verifyToken, this.adminAccountController.updateAdminAccountPassword);
    this.router.route(`${this.path}/month-wise-data`).get(this.adminAccountController.getMonthlyFinanceData);
      
  }
}

export default AdminRoute;

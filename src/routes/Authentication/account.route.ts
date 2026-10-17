import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import { AccountController } from '@/controllers/Authentication/account.controller';
import AccountRepo from '@/repository/Authentication/account.repository';
import StoreInfoRepo from '@/repository/Authentication/storeInfo.repository';

import validationMiddleware from '@/middlewares/validation.middleware';
import {
  createAccountSchema,
  createMember,
  loginSchema,
  updateAccountSchema,
} from '@/validationSchema/account.validation.schema';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import { verifyToken } from '@/helper/auth.helper';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import AddressRepo from '@/repository/Authentication/address.repository';
import PermissionRepo from '@/repository/Permission/permission.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import SaveCardRepo from '@/repository/SaveCard/saveCard.repository';

class AccountRoute implements Routes {
  public path = '/account';
  public router = Router();
  public accountController = new AccountController(
    new AccountRepo(),
    new AccountRolesRepo(),
    new StoreInfoRepo(),
    new AccountUsersRepo(),
    new SupplierInfoRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
    new AddressRepo(),
    new PermissionRepo(),
    new SaveCardRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(validationMiddleware(createAccountSchema, 'body'), this.accountController.createAccount);
    this.router
      .route(`${this.path}/login`)
      .post(validationMiddleware(loginSchema, 'body'), this.accountController.getLoginDetails);
    this.router.route(`${this.path}/details`).get(verifyToken, this.accountController.getAccountDetails);
    this.router.route(`${this.path}/forgot-password`).post(this.accountController.forgotPassword);
    this.router.route(`/change-password`).post(verifyToken, this.accountController.updateAccountPassword);
    this.router.route(`${this.path}/check-token`).get(verifyToken, this.accountController.checkToken);
    this.router
      .route(`${this.path}/member`)
      .post(verifyToken, validationMiddleware(createMember, 'body'), this.accountController.createMember);
    this.router.route(`${this.path}/ownership`).get(verifyToken, this.accountController.getOwnerShopDetails);
  }
}

export default AccountRoute;

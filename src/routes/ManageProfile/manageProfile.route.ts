import { Router } from 'express';
import multer from 'multer';
import { Routes } from '@/interfaces/routes.interface';
import AccountRepo from '@/repository/Authentication/account.repository';
import StoreInfoRepo from '@/repository/Authentication/storeInfo.repository';

import validationMiddleware from '@/middlewares/validation.middleware';
import {
  adminPasswordUpdate,
  deleteAccountAdress,
  updateAccountAdress,
  updateAccountSchema,
} from '@/validationSchema/account.validation.schema';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import { verifyToken } from '@/helper/auth.helper';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import AddressRepo from '@/repository/Authentication/address.repository';
import {  uploadMedia } from '@/middlewares/imageUpload.middleware';
import { ManageProfileController } from '@/controllers/ManageProfile/manageProfile.controller';

class ManageProfileRoute implements Routes {
  public path = '/manage-profile';
  public router = Router();
  public manageProfileController = new ManageProfileController(
    new AccountRepo(),
    new AccountRolesRepo(),
    new StoreInfoRepo(),
    new AccountUsersRepo(),
    new SupplierInfoRepo(),
    new AddressRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/personal-details/update`)
      .patch(
        verifyToken,
        uploadMedia.single('photo'),
        validationMiddleware(updateAccountSchema, 'body'),
        this.manageProfileController.updateOwnershipDetials,
      );
    this.router.route(`${this.path}/updatePassword`).post(this.manageProfileController.updatePassword);
    this.router
      .route(`${this.path}/set-default`)
      .patch(
        verifyToken,
        validationMiddleware(updateAccountAdress, 'body'),
        this.manageProfileController.setDefaultAddress,
      );
    this.router.route(`${this.path}/get-address/:uuid`).get(verifyToken, this.manageProfileController.getSingleAddress);
    this.router
      .route(`${this.path}/get-single-user-address/:uuid`)
      .get(verifyToken, this.manageProfileController.getAllAddressOfSingleUser);
    this.router.route(`${this.path}/update-address`).patch(verifyToken, this.manageProfileController.updateAddress);
    this.router.route(`${this.path}/create-address`).post(verifyToken, this.manageProfileController.createAddress);

    this.router
      .route(`${this.path}/remove-address/:uuid`)
      .delete(
        verifyToken,
        validationMiddleware(deleteAccountAdress, 'params'),
        this.manageProfileController.deleteAddress,
      );
    this.router.route(`${this.path}/create-address`).post(verifyToken, this.manageProfileController.createAddress);

    this.router
      .route(`/admin/personal-details`)
      .post(verifyToken, uploadMedia.single('image'),  this.manageProfileController.adminManageProfile);

    this.router
      .route(`/admin/personal-details/get`)
      .get(verifyToken, this.manageProfileController.getAdminProfileDetails);

    this.router
      .route('/admin/manage-password')
      .post(
        verifyToken,
        validationMiddleware(adminPasswordUpdate, 'body'),
        this.manageProfileController.adminManagePassword,
      );
  }
}

export default ManageProfileRoute;

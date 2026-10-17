import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';

import { verifyToken } from '@/helper/auth.helper';
import AdminSettingsRepo from '@/repository/AdminSettings/adminSettings.repository';
import { AdminSettingsController } from '@/controllers/AdminSettings/adminSettings.controller';
import validationMiddleware from '@/middlewares/validation.middleware';
import { adminSettingSchema } from '@/validationSchema/adminSettings.validation.schema';

class AdminSettingsRoute implements Routes {
  public path = '/admin-settings';
  public router = Router();
  public adminSettingsController = new AdminSettingsController(new AdminSettingsRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/vat-charges`).get(verifyToken, this.adminSettingsController.getVatCharge);
    this.router.route(`${this.path}/adminData`).get(verifyToken, this.adminSettingsController.getadminSettingData);
    this.router.route(`${this.path}/vat-charges`).put(verifyToken, this.adminSettingsController.updateVatCharges);
    this.router.route(`${this.path}/replace-days`).put(verifyToken, this.adminSettingsController.updateReplaceDays);
    this.router.route(`${this.path}/refund-days`).post(verifyToken, this.adminSettingsController.createRefundDays);
    this.router.route(`${this.path}/default-ord-commission`).post(verifyToken, this.adminSettingsController.createOrdCommission);
    this.router.route(`${this.path}/default-bank-commission`).post(verifyToken, this.adminSettingsController.createBankCommission);

  }
}

export default AdminSettingsRoute;

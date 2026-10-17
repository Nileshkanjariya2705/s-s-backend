import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import AccountRepo from '@/repository/Authentication/account.repository';
import { verifyToken } from '@/helper/auth.helper';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import { staffController } from '@/controllers/Staff/staff.controller';
import BranchUsersRepo from '@/repository/Branches/branchUser.repository';
import BranchesRepo from '@/repository/Branches/branches.repository';
import StoreInfoRepo from '@/repository/Authentication/storeInfo.repository';

class StaffRoute implements Routes {
  public path = '/staff';
  public router = Router();
  public staffController = new staffController(
    new AccountRepo(),
    new AccountRolesRepo(),
    new AccountUsersRepo(),
    new BranchUsersRepo(),
    new BranchesRepo(),
    new StoreInfoRepo(),
    new SupplierInfoRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/fetch-staff`).get(verifyToken, this.staffController.getStaffMembers);
    this.router.route(`${this.path}/single-member`).get(verifyToken, this.staffController.getSingleStaffMember);
    this.router.route(`${this.path}/create-member`).post(verifyToken, this.staffController.createMember);
    this.router.route(`${this.path}/update-member`).patch(verifyToken, this.staffController.updateSingleStaffMember);
    this.router
      .route(`${this.path}/delete-staff-member/:user_uuid`)
      .delete(verifyToken, this.staffController.deleteMember);
  }
}

export default StaffRoute;

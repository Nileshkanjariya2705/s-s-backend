import { Router } from 'express';
import { Routes } from '@/interfaces/routes.interface';
import { BranchesController } from '@/controllers/Branches/branches.conroller';
import BranchesRepo from '@/repository/Branches/branches.repository';
import BranchUsersRepo from '@/repository/Branches/branchUser.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import RolesRepo from '@/repository/Roles/roles.repository';
import { verifyToken } from '@/helper/auth.helper';

class BranchesRoute implements Routes {
  public path = '/branch';
  public router = Router();
  public branchesController = new BranchesController(
    new BranchesRepo(),
    new BranchUsersRepo(),
    new AccountUsersRepo(),
    new RolesRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/get-branches`).get(verifyToken, this.branchesController.getAllBranches);
    this.router.route(`${this.path}/get-all-branches`).get(verifyToken, this.branchesController.getBranchesDropdown);
    this.router.route(`${this.path}/get-single-branch`).get(verifyToken, this.branchesController.getSingleBranches);
    this.router.route(`${this.path}/get-entity-users`).get(verifyToken, this.branchesController.getEntityUser);
    this.router.route(`${this.path}/create-branch`).post(verifyToken, this.branchesController.createBranch);
    this.router.route(`${this.path}/update-branch`).patch(verifyToken, this.branchesController.updateBranch);
    this.router
      .route(`${this.path}/delete-branch/:branch_uuid`)
      .delete(verifyToken, this.branchesController.deleteBranch);
  }
}

export default BranchesRoute;

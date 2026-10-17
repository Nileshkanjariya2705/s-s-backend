import { RolesController } from '@/controllers/Roles/roles.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import RolesRepo from '@/repository/Roles/roles.repository';
import { Router } from 'express';

class RolesRoute implements Routes {
  public path = '/roles';
  public router = Router();
  public rolesController = new RolesController(new RolesRepo(), new AccountRolesRepo(), new AccountUsersRepo());

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.route(`${this.path}/create`).post(verifyToken, this.rolesController.createRoles);
    this.router.route(`${this.path}/update`).post(verifyToken, this.rolesController.updateRoles);
    this.router.route(`${this.path}/getRoles`).get(verifyToken, this.rolesController.getRoles);
    this.router.route(`${this.path}/get-Roles-list`).get(verifyToken, this.rolesController.getRolesList);
    this.router.route(`${this.path}/:deleteId`).delete(verifyToken, this.rolesController.deleteRole);
    this.router.route(`${this.path}/edit/:roleId`).get(verifyToken, this.rolesController.getSingleRole);
  }
}
export default RolesRoute;

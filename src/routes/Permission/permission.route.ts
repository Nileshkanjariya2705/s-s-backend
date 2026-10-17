import { PermissionController } from '@/controllers/permission/permission.controller';
import { Routes } from '@/interfaces/routes.interface';
import PermissionRepo from '@/repository/Permission/permission.repository';
import RolesRepo from '@/repository/Roles/roles.repository';
import { Router } from 'express';

class PermissionRoute implements Routes {
  public path = '/permission';
  public router = Router();
  public rolesController = new PermissionController(new PermissionRepo());

  constructor() {
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.route(`${this.path}/getPermission`).get(this.rolesController.getPermission);
  }
}
export default PermissionRoute;

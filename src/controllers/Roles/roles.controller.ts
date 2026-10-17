import { generalResponse, responseType, statusType } from '@/helper/common.helper';
import { STAFF_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountRoles from '@/models/accountRoles.model';
import Permissions from '@/models/permissions.model';
import RolePermissions from '@/models/rolePermissions.model';
import Roles from '@/models/roles.model';
import User from '@/models/user.model';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import RolesRepo from '@/repository/Roles/roles.repository';
import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

export class RolesController {
  constructor(
    private readonly rolesRepository: RolesRepo,
    private readonly accountRolesRepository: AccountRolesRepo,
    private readonly accountUserRepository: AccountUsersRepo,
  ) {}

  public readonly createRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { RoleName, Permissions, entity_type, user_entity_uuid, status, RoleName_ar, RoleName_ur } = req.body.data;
      const result = await db.transaction(async (t) => {
        const slug = RoleName.includes(' ') ? RoleName.replace(/ /g, '-') : RoleName;

        const roleExists = await this.rolesRepository.get({
          where: {
            name: RoleName,
          },
        });
        let entityExists;
        if (roleExists) {
          entityExists = await this.accountRolesRepository.get({
            where: {
              role_uuid: roleExists.uuid,
              entity_uuid: user_entity_uuid,
            },
          });
        }
        if (entityExists && entityExists.entity_type === entity_type) {
          return generalResponse(res, null, STAFF_MESSAGES.ROLE_ALREADY_EXISTS, responseType.FAILURE, true, 200);
        } else {
          const createRole = await this.rolesRepository.createRole({
            data: {
              name: RoleName,
              name_ar: RoleName_ar,
              name_ur: RoleName_ur,
              slug: slug,
              status: status,
            },
            action: 'create',
          });
          const rolePermissions = [];
          Permissions.map((item) => {
            rolePermissions.push({
              role_uuid: createRole.uuid,
              permission_uuid: item,
            });
          });

          await RolePermissions.bulkCreate(rolePermissions, { transaction: t });

          await this.accountRolesRepository.createAccountRoles(
            {
              data: {
                entity_type: entity_type,
                entity_uuid: user_entity_uuid,
                role_uuid: createRole.uuid,
              },
              action: 'create',
            },
            { transaction: t },
          );
          return generalResponse(res, null, STAFF_MESSAGES.ROLE_ADDED, responseType.SUCCESS, true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { RoleName, Permissions, entity_type, user_entity_uuid, status, roleId, RoleName_ar, RoleName_ur } =
        req.body.data;
      const result = await db.transaction(async (t) => {
        const slug = RoleName.includes(' ') ? RoleName.replace(/ /g, '-') : RoleName;
        const staffAssign = await this.accountUserRepository.get({
          where: {
            role_uuid: roleId,
          },
          include: {
            model: User,
            where: {
              is_active: true,
            },
          },
        });
        if (staffAssign && status === statusType.INACTIVE) {
          return generalResponse(res, '', STAFF_MESSAGES.ALREADY_ASSIGNED, responseType.FAILURE, true, 400);
        } else {
          await Roles.update(
            { name: RoleName, name_ar: RoleName_ar, name_ur: RoleName_ur, slug: slug, status: status },
            {
              where: {
                uuid: roleId,
              },
            },
          );
          const rolePermissions = [];
          Permissions.map((item) => {
            rolePermissions.push({
              permission_uuid: item,
              role_uuid: roleId,
            });
          });
           await RolePermissions.destroy({
            where: {
              role_uuid: roleId,
            },
          });
           await RolePermissions.bulkCreate(rolePermissions, { transaction: t });
           await AccountRoles.update(
            {
              entity_type: entity_type,
              entity_uuid: user_entity_uuid,
            },
            {
              where: {
                role_uuid: roleId,
              },
            },
          );
          return generalResponse(res, null, STAFF_MESSAGES.ROLE_UPDATED, responseType.SUCCESS, true, 202);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getRoles = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await db.transaction(async (t) => {
        const getAllRoles = await this.accountRolesRepository.getAllRoles(req.query, { transaction: t });
        return generalResponse(res, getAllRoles, STAFF_MESSAGES.DATA_FETCHED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getRolesList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await db.transaction(async (t) => {
        const getAllRoles = await this.accountRolesRepository.getAccountRolesList(req.query, { transaction: t });
        return generalResponse(res, getAllRoles, STAFF_MESSAGES.DATA_FETCHED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getRole = await this.rolesRepository.get({
        where: {
          uuid: req.params.deleteId,
        },
      });
      const checkRoleIsAssigned = await this.accountUserRepository.get({
        where: {
          role_uuid: req.params.deleteId,
        },
      });
      if (checkRoleIsAssigned) {
        return generalResponse(res, null, STAFF_MESSAGES.UNABLE_DELETE, responseType.FAILURE, false, 200);
      }
      if (getRole) {
        const deleteRole = await this.rolesRepository.deleteData({
          where: {
            uuid: req.params.deleteId,
          },
        });
        const deletePermission = await RolePermissions.destroy({
          where: {
            role_uuid: req.params.deleteId,
          },
        });
        const deleteAccountRole = await this.accountRolesRepository.deleteData({
          where: {
            role_uuid: req.params.deleteId,
          },
        });
      }
      return generalResponse(res, '', STAFF_MESSAGES.ROLE_DELETED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleRole = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { roleId } = req.params;
      const { entity_type } = req.query;
      const getRole = await this.rolesRepository.get({
        where: {
          uuid: roleId,
        },
        attributes: ['name', 'status', 'name_ar', 'name_ur'],
      });
      if (getRole) {
        const getAllPermission = await Permissions.findAll({
          where: {
            permission_owner: entity_type as string,
          },
          attributes: ['uuid'],
        });
        const getPermission = await RolePermissions.findAll({
          where: {
            role_uuid: roleId,
          },
          attributes: ['permission_uuid'],
        });
        const result = {};
        getAllPermission.forEach((item) => {
          result[item.uuid] = getPermission.some((permi) => permi.permission_uuid === item.uuid);
        });
        const finalResult = [{ role: getRole, permission: result }];
        return generalResponse(res, finalResult, STAFF_MESSAGES.DATA_FETCHED, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, STAFF_MESSAGES.DATA_FETCHED, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

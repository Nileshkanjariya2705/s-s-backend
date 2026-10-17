import { generalResponse, responseType } from '@/helper/common.helper';
import { PERMISSION, USER_MESSAGES } from '@/messages/users.messages';
import PermissionRepo from '@/repository/Permission/permission.repository';
import { Request, Response, NextFunction } from 'express';

export class PermissionController {
  constructor(private readonly permissionRepository: PermissionRepo) {}
  public readonly getPermission = async (req: Request, res: Response, next: NextFunction) => {
    const { entity_type }: { entity_type?: string } = req.query;
    try {
      const permissions = await this.permissionRepository.getAll({
        attributes: ['uuid', 'name', 'permission_type'],
        where: {
          permission_owner: entity_type,
        },
      });
      return generalResponse(res, permissions, PERMISSION.PERMISSION_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

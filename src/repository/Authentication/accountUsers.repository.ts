import AccountUsers from '@/models/accountUsers.model';
import BaseRepository from '../base.repository';
import { BuildAccountUsersArgs } from '@/interfaces/Authentication/accountUsers.interface';
import RolePermissions from '@/models/rolePermissions.model';
import { Op } from 'sequelize';

export default class AccountUsersRepo extends BaseRepository<AccountUsers> {
  constructor() {
    super(AccountUsers.name);
  }
  readonly accountUser = async (accountUserArgs: BuildAccountUsersArgs, extraParam: { transaction }) => {
    const { data } = accountUserArgs;
    const { transaction } = extraParam;

    const accountUsers = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return accountUsers;
  };
  async getAllUserOfEntity(entity_uuid, permission_id) {
    let where = {
      entity_uuid: entity_uuid,
    };
    if (Array.isArray(entity_uuid)) {
      where = {
        entity_uuid: {
          [Op.in]: entity_uuid,
        },
      };
    }
    try {
      const accountUsers = await this.getAll({
        attributes: ['user_uuid', 'role_uuid'],
        where,
      });

      const permissibleUser = [];
      for (const user of accountUsers) {
        const checkRolePermission = await RolePermissions.findOne({
          where: {
            role_uuid: user.role_uuid,
            permission_uuid: permission_id,
          },
        });
        if (checkRolePermission) {
          permissibleUser.push(user.user_uuid);
        }
      }
      const filteredUser = permissibleUser.filter((userUuid) => userUuid !== undefined);
      return filteredUser;
    } catch (error) {
      return error;
    }
  }

  async getAllUserOfEntityWithoutPermissionCheck(entity__uuid) {
    try {
      const accountUsers = await this.getAll({
        attributes: ['user_uuid', 'role_uuid'],
        where: {
          entity_uuid: entity__uuid,
        },
      });

      return accountUsers;
    } catch (error) {
      return error;
    }
  }
}

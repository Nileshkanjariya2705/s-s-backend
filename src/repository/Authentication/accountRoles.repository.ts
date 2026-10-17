import BaseRepository from '../base.repository';
import AccountRoles from '@/models/accountRoles.model';
import { BuildAccountRoleArgs } from '@/interfaces/Authentication/accountRoles.interface';
import Roles from '@/models/roles.model';
import { Op } from 'sequelize';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import { statusType } from '@/helper/common.helper';

export default class AccountRolesRepo extends BaseRepository<AccountRoles> {
  constructor() {
    super(AccountRoles.name);
  }
  readonly createAccountRoles = async (accountRoleArgs: BuildAccountRoleArgs, extraParam: { transaction }) => {
    const { data, action } = accountRoleArgs;
    const { transaction } = extraParam;
    return db.transaction(async (transaction) => {
      if (action === 'create') {
        const accountRole = await this.create(
          {
            ...data,
          },
          { transaction },
        );
        return accountRole;
      } else {
        const { data, accountRole } = accountRoleArgs;
        return db.transaction(async (transaction) => {
          const buildAccountRoleInfo = setInstance({ ...data }, accountRole);
          await buildAccountRoleInfo.save({ transaction });
          return buildAccountRoleInfo;
        });
      }
    });
  };
  readonly getAllRoles = async (data, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const { userId, roleName, apiParams } = data;

    const { searchText, sort, isAsc } = apiParams;
    let srch = {};
    let order;
    const isOrderAsc = isAsc === 'true';

    if (sort) {
      if (sort === 'name') {
        order = [['role_id', sort, isOrderAsc ? 'ASC' : 'DESC']];
      }
    }

    if (searchText) {
      srch = {
        '$role_id.name$': {
          [Op.like]: `%${searchText}%`,
        },
      };
    }

    let pagination = {};
    if (apiParams) {
      const { limit, page } = apiParams;
      pagination = {
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      };
    }

    const getAllRole = await this.getAllData({
      where: {
        entity_uuid: userId as string,
        ...srch,
      },
      include: {
        model: Roles,
        attributes: ['name', 'status'],
        where: {
          name: {
            [Op.ne]: roleName,
          },
        },
      },
      transaction: transaction,
      ...pagination,
    });
    return getAllRole;
  };

  readonly getAccountRolesList = async (data, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const { userId, roleName, apiParams, searchText } = data;
    let srch = {};

    if (searchText) {
      srch = {
        name: {
          [Op.like]: `%${searchText}%`,
        },
      };
    }
    let pagination = {};
    if (apiParams) {
      const { limit, page } = apiParams;
      pagination = {
        limit: +limit,
        offset: (+page - 1) * +limit,
      };
    }
    const getAllRole = await this.getAllData({
      where: {
        entity_uuid: userId as string,
      },
      include: {
        model: Roles,
        where: {
          status: statusType.ACTIVE,
        },
        attributes: ['name', 'status'],
      },
      transaction: transaction,
      ...pagination,
    });
    return getAllRole;
  };
}

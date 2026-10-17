import Roles from '@/models/roles.model';
import BaseRepository from '../base.repository';
import { BuildRoleArgs } from '@/interfaces/Roles/role.interface';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class RolesRepo extends BaseRepository<Roles> {
  constructor() {
    super(Roles.name);
  }
  readonly createRole = async (roleCreateArgs: BuildRoleArgs) => {
    const { data } = roleCreateArgs;

    const role = await this.create(
      {
        ...data,
      },
      // { transaction },
    );
    return role;
  };
  readonly updateRoleInfo = async (accountCreateArgs: Required<BuildRoleArgs>) => {
    const { data, role } = accountCreateArgs;
    return db.transaction(async (transaction) => {
      const buildRoleInfo = setInstance({ ...data }, role);
      await buildRoleInfo.save({ transaction });
      return buildRoleInfo;
    });
  };
}

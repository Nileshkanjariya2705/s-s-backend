import db from '@/models';
import BaseRepository from '../base.repository';
import BranchUsers from '@/models/branchUser.model';
import { BuildBranchUsersArgs } from '@/interfaces/Branches/branchUser.interface';

export default class BranchUsersRepo extends BaseRepository<BranchUsers> {
  constructor() {
    super(BranchUsers.name);
  }
  readonly createBranch = async (branchUserCreateArgs: BuildBranchUsersArgs, extraParam: { transaction }) => {
    const { data } = branchUserCreateArgs;

    const { transaction } = extraParam;

    const branch = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return branch;
  };
}

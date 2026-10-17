import db from '@/models';
import BaseRepository from '../base.repository';
import Branch from '@/models/branches.model';
import { BuildBranchArgs } from '@/interfaces/Branches/branches.interface';

export default class BranchesRepo extends BaseRepository<Branch> {
  constructor() {
    super(Branch.name);
  }
  readonly createBranch = async (branchCreateArgs: BuildBranchArgs, extraParam: { transaction }) => {
    const { data } = branchCreateArgs;

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

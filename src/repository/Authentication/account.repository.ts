import { BuildAccountArgs } from '@/interfaces/Authentication/account.interface';
import BaseRepository from '../base.repository';
import { Op } from 'sequelize';
import User from '@/models/user.model';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class AccountRepo extends BaseRepository<User> {
  constructor() {
    super(User.name);
  }
  readonly createAccount = async (accountCreateArgs: BuildAccountArgs, extraParam: { transaction }) => {
    const { data } = accountCreateArgs;
    const { transaction } = extraParam;

    const account = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return account;
  };
  readonly getUserAccount = ({ username }: { username: string }, selectedAttributes?: string[]) => {
    return this.get({
      where: {
        [Op.or]: [{ email: username }, { username: username }] as {},
        // is_active: true,
      },
      attributes: selectedAttributes
        ? selectedAttributes
        : ['username', 'email', 'uuid', 'image', 'phone', 'created_at', 'password', 'is_active'],
      rejectOnEmpty: false,
      raw: true,
    });
  };

  readonly getUserAccountPassword = ({ username }: { username: string }) => {
    return this.get({
      where: {
        [Op.or]: [{ email: username }, { username: username }] as {},
        is_active: true,
      },
      attributes: ['username', 'email', 'uuid', 'image', 'phone', 'is_active'],
      rejectOnEmpty: false,
    });
  };

  readonly updateUser = async (accountCreateArgs: Required<BuildAccountArgs>) => {
    const { data, user } = accountCreateArgs;

    return db.transaction(async (transaction) => {
      const buildUser = setInstance({ ...data }, user);
      await buildUser.save({ transaction });
      return buildUser;
    });
  };
}

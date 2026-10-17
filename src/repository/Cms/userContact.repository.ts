import BaseRepository from '../base.repository';
import UserContact from '@/models/userFeedback.model';
import { BuildCmsUserContactArgs } from '@/interfaces/Contact/userContactCms.interface';

export default class UserContactRepo extends BaseRepository<UserContact> {
  constructor() {
    super(UserContact.name);
  }
  readonly createUserContactDetail = async (userContactArgs: BuildCmsUserContactArgs, extraParam: { transaction }) => {
    const { data } = userContactArgs;
    const { transaction } = extraParam;

    const account = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return account;
  };
}

import { setInstance } from '@/helper/sequelize.helper';
import db from '@/models';
import BaseRepository from '../base.repository';
import Faq from '@/models/faq.model';
import { BuildCmsFaqArgs } from '@/interfaces/Faq/faq.interface';

export default class FaqRepo extends BaseRepository<Faq> {
  constructor() {
    super(Faq.name);
  }
  readonly updateFaqDetails = async (cmsFaqArgs: Required<BuildCmsFaqArgs>) => {
    const { data, faq } = cmsFaqArgs;
    return db.transaction(async (transaction) => {
      const buildCms = setInstance({ ...data }, faq);
      await buildCms.save({ transaction });
      return buildCms;
    });
  };
  readonly createFaqDetail = async (cmsFaqDetailArgs: BuildCmsFaqArgs, extraParam: { transaction }) => {
    const { data } = cmsFaqDetailArgs;
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

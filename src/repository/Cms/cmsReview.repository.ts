import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import { BuildCmsReviewArgs } from '@/interfaces/Authentication/cmsReview.interface';
import CmsReview from '@/models/cmsReview.model';

export default class CmsReviewRepo extends BaseRepository<CmsReview> {
  constructor() {
    super(CmsReview.name);
  }
  readonly createReview = async (cmsReviewCreateArgs: BuildCmsReviewArgs, extraParam: { transaction }) => {
    const { data } = cmsReviewCreateArgs;

    const { transaction } = extraParam;

    const account = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return account;
  };

  readonly updateReview = async (cmsReviewCreateArgs: Required<BuildCmsReviewArgs>) => {
    const { data, cmsReview } = cmsReviewCreateArgs;
    return db.transaction(async (transaction) => {
      // set Data.
      const buildUser = setInstance({ ...data }, cmsReview);
      // save User
      await buildUser.save({ transaction });
      // set user roles table data.
      return buildUser;
    });
  };
}

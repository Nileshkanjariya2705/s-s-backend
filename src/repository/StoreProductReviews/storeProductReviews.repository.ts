import BaseRepository from '../base.repository';
import { BuildStoreProdReviewsArgs } from '@/interfaces/StoreProductReviews/storeProductReviews.interface';
import { setInstance } from '@/helper/sequelize.helper';
import db from '@/models';
import StoreProductReviews from '@/models/storeProductReviews.model';

export default class StoreProductReviewsRepository extends BaseRepository<StoreProductReviews> {
  constructor() {
    super(StoreProductReviews.name);
  }
  readonly createReviews = async (storeReviewCreateArgs: BuildStoreProdReviewsArgs) => {
    const { data } = storeReviewCreateArgs;

    const review = await this.create(
      {
        ...data,
      },
      // { transaction },
    );
    return review;
  };
  readonly updateReviewsAndRating = async (storeReviewCreateArgs: Required<BuildStoreProdReviewsArgs>) => {
    const { data, review } = storeReviewCreateArgs;
    return db.transaction(async (transaction) => {
      const buildReviewInfo = setInstance({ ...data }, review);
      await buildReviewInfo.save({ transaction });
      return buildReviewInfo;
    });
  };
}

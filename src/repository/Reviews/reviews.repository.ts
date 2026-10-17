import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import Reviews from '@/models/reviews.model';
import { BuildReviewsArgs } from '@/interfaces/Reviews/reviews.interface';

export default class ReviewsRepository extends BaseRepository<Reviews> {
  constructor() {
    super(Reviews.name);
  }
  readonly createReviews = async (reviewCreateArgs: BuildReviewsArgs) => {
    const { data } = reviewCreateArgs;

    const review = await this.create(
      {
        ...data,
      },
      // { transaction },
    );
    return review;
  };
  readonly updateReviewsAndRating = async (reviewCreateArgs: Required<BuildReviewsArgs>) => {
    const { data, review } = reviewCreateArgs;
    return db.transaction(async (transaction) => {
      const buildReviewInfo = setInstance({ ...data }, review);
      await buildReviewInfo.save({ transaction });
      return buildReviewInfo;
    });
  };
}

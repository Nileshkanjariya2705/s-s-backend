import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import { BuildReviewsArgs } from '@/interfaces/Reviews/reviews.interface';
import OrderReplacementRequests from '@/models/orderReplacement';

export default class ReplacementRequestRepository extends BaseRepository<OrderReplacementRequests> {
  constructor() {
    super(OrderReplacementRequests.name);
  }
  readonly createReplacement = async (ReplacementRequestCreateArgs: BuildReviewsArgs) => {
    const { data } = ReplacementRequestCreateArgs;

    const review = await this.create(
      {
        ...data,
      },
      // { transaction },
    );
    return review;
  };
  readonly updateReplacementRequest= async (reviewCreateArgs: Required<BuildReviewsArgs>) => {
    const { data, review } = reviewCreateArgs;
    return db.transaction(async (transaction) => {
      const buildReviewInfo = setInstance({ ...data }, review);
      await buildReviewInfo.save({ transaction });
      return buildReviewInfo;
    });
  };
}

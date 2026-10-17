import { generalResponse, responseType } from '@/helper/common.helper';
import { REVIEWS_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import ReviewsRepository from '@/repository/Reviews/reviews.repository';

import { NextFunction, Request, Response } from 'express';

export class ReviewsController {
  constructor(private readonly reviewsRepository: ReviewsRepository) {}

  public readonly getReviewsAndRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId, supplier_info_uuid, reviews, rating } = req.body;

      const review = await this.reviewsRepository.get({
        where: {
          purchase_request_uuid: purchaseReqId,
          supplier_info_uuid: supplier_info_uuid,
        },
      });
      if (!review) {
        const createReviews = await this.reviewsRepository.createReviews({
          data: {
            purchase_request_uuid: purchaseReqId,
            supplier_info_uuid: supplier_info_uuid,
            reviews: reviews,
            rating: rating,
          },
          action: 'create',
        });

        return generalResponse(res, createReviews, REVIEWS_MESSAGES.REVIEWS_ADDED, responseType.SUCCESS, true, 200);
      } else {
        const createReviews = await this.reviewsRepository.updateReviewsAndRating({
          data: {
            purchase_request_uuid: purchaseReqId,
            supplier_info_uuid: supplier_info_uuid,
            reviews: reviews,
            rating: rating,
          },

          action: 'update',
          review: review,
        });

        return generalResponse(res, createReviews, REVIEWS_MESSAGES.REVIEWS_UPDATED, responseType.SUCCESS, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

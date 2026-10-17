import { generalResponse, responseType } from '@/helper/common.helper';
import { REVIEWS_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import Products from '@/models/products.model';
import StoreInfo from '@/models/storesInfo.model';
import StoreProductReviewsRepository from '@/repository/StoreProductReviews/storeProductReviews.repository';
import { NextFunction, Request, Response } from 'express';
import sequelize, { Op } from 'sequelize';

export class StoreProductReviewsController {
  constructor(private readonly storeProductReviewsRepository: StoreProductReviewsRepository) {}

  public readonly addStoreProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_uuid, review_by, store_info_uuid, supplier_info_uuid, reviews, rating } = req.body;
      const review = await this.storeProductReviewsRepository.get({
        where: {
          product_uuid: product_uuid,
          supplier_info_uuid: supplier_info_uuid,
          store_info_uuid: store_info_uuid,
        },
      });
      if (!review) {
        const createReviews = await this.storeProductReviewsRepository.createReviews({
          data: {
            product_uuid: product_uuid,
            review_by: review_by,
            supplier_info_uuid: supplier_info_uuid,
            store_info_uuid: store_info_uuid,
            reviews: reviews,
            rating: rating,
          },
          action: 'create',
        });

        return generalResponse(res, createReviews, REVIEWS_MESSAGES.REVIEWS_ADDED, responseType.SUCCESS, true, 200);
      } else {
        const createReviews = await this.storeProductReviewsRepository.updateReviewsAndRating({
          data: {
            product_uuid: product_uuid,
            review_by: review_by,
            supplier_info_uuid: supplier_info_uuid,
            store_info_uuid: store_info_uuid,
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

  public readonly getReviewRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams, supplierId } = req.query;
      const { page, limit, sort, isAsc, searchText } = apiParams as {
        page: string;
        limit: string;
        sort: string;
        isAsc: string;
        searchText: string;
      };
      const isOrderAsc = isAsc === 'true';
      let order;
      if (sort === 'productName') {
        order = [[sequelize.literal('product_info.name_en'), isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'rating') {
        order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
      }
      let srch = {};
      if (searchText) {
        srch = {
          [sequelize.Op.or]: [
            {
              '$product_info.name_en$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              store_info_uuid: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      const reviewRating = await this.storeProductReviewsRepository.getAllData({
        include: [
          {
            model: Products,
            attributes: ['name_en', 'name_ur', 'name_ar'],
          },
        ],
        where: {
          ...srch,
          supplier_info_uuid: supplierId as string,
        },
        limit: +limit,
        offset: (+page - 1) * +limit,
        order: order ? order : [['created_at', 'DESC']],
        attributes: ['uuid', 'store_info_uuid', 'rating', 'reviews'],
      });
      return generalResponse(res, reviewRating, REVIEWS_MESSAGES.REVIEWS_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleReviewRating = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const reviewRating = await this.storeProductReviewsRepository.getAll({
        include: [
          {
            model: Products,
            attributes: ['name_en', 'name_ur', 'name_ar'],
          },
          {
            model: StoreInfo,
            attributes: ['company_name'],
          },
        ],
        where: {
          uuid: req.query.ratingId as string,
        },
        attributes: ['uuid', 'store_info_uuid', 'rating', 'reviews'],
      });
      return generalResponse(res, reviewRating, REVIEWS_MESSAGES.REVIEWS_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import { NextFunction, Request, Response } from 'express';
import path from 'path';

import db from '@/models';
import { generalResponse, responseType } from '@/helper/common.helper';
import { CMS_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import CmsReviewRepo from '@/repository/Cms/cmsReview.repository';
import CmsReview from '@/models/cmsReview.model';
const imgPath = path.join(__dirname, '../public/images');
export class CmsReviewController {
  constructor(private cmsReviewRepository: CmsReviewRepo) {}

  public readonly createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        await this.cmsReviewRepository.createReview(
          {
            data: { ...req.body, profile_image: req.file.filename },
          },
          { transaction: t },
        );
      });
      return generalResponse(res, '', CMS_MESSAGES?.CMS_CREATED_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllReviews = async (req: Request, res: Response) => {
    try {
      const reviews = await this.cmsReviewRepository.getAllData({ order: [['created_at', 'DESC']] });
      return generalResponse(res, reviews, CMS_MESSAGES?.CMS_REVIEW_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleReview = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.body;
      const getSingleReview = await this.cmsReviewRepository.getAll({
        where: {
          uuid: uuid,
        },
        attributes: { exclude: ['updated_at', 'deleted_at', 'created_at'] },
      });
      return generalResponse(res, getSingleReview, CMS_MESSAGES?.CMS_REVIEW_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateReview = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.body;

      const findReview = await this.cmsReviewRepository.get({
        where: {
          uuid: uuid,
        },
      });
      if (!findReview) {
        return generalResponse(
          res,
          null,
          CMS_MESSAGES?.CMS_UNAUTHORIZE_UPDATE_REQUEST,
          responseType.FAILURE,
          true,
          200,
        );
      }
      const updateReview = await CmsReview.update(
        {
          ...req.body,
          profile_image: req.file ? req.file.filename : findReview.profile_image,
        },
        { where: { uuid: uuid } },
      );
      return generalResponse(res, updateReview, CMS_MESSAGES.CMS_UPDATE_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteReview = async (req: Request, res: Response) => {
    try {
      const { reviewId } = req.body;
      const findReview = await this.cmsReviewRepository.get({
        where: {
          uuid: reviewId,
        },
      });
      if (!findReview) {
        return generalResponse(
          res,
          null,
          CMS_MESSAGES?.CMS_UNAUTHORIZE_UPDATE_REQUEST,
          responseType.FAILURE,
          true,
          200,
        );
      }
      const updateReview = await this.cmsReviewRepository.deleteData({
        where: {
          uuid: reviewId,
        },
      });
      return generalResponse(res, updateReview, CMS_MESSAGES?.CMS_DELETED_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

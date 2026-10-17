import { NextFunction, Request, Response } from 'express';
import { generalResponse, responseType } from '@/helper/common.helper';
import { CMS_MESSAGES, FAQ_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import CmsPages from '@/models/cmsPages.model';
import db from '@/models';
import CmsPagesRepo from '@/repository/Cms/cmsPages.repository';
import FaqRepo from '@/repository/Cms/faq.repository';
import Faq from '@/models/faq.model';

export class CmsFaqController {
  constructor(private readonly cmsPagesRepository: CmsPagesRepo, private readonly faqPageRepository: FaqRepo) {}
  public readonly updateFaqPage = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      let key = Object.keys(req.body)[0];
      const requestedContent = JSON.parse(req.body[key]);
      let faqImage = [...requestedContent?.faqImage];
      if (req?.files && req?.files?.faqImage && req?.files?.faqImage.length > 0) {
        req.files.faqImage.forEach((item, index) => {
          const findFileIndex = faqImage.findIndex((fileItem) => typeof fileItem.image !== 'string');
          if (findFileIndex !== -1) {
            faqImage[findFileIndex]['image'] = item.filename;
          }
        });
      }
      let newObj = {
        ...requestedContent,
        faqImage: faqImage,
      };
      await CmsPages.update(
        { [key]: JSON.stringify(newObj) },
        {
          where: {
            page_title: 'FAQ',
          },
        },
      );
      return generalResponse(res, '', CMS_MESSAGES?.CMS_PAGE_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly createFaq = async (req: Request, res: Response) => {
    try {
      await db.transaction(async (t) => {
        await this.faqPageRepository.createFaqDetail(
          {
            data: req.body,
          },
          { transaction: t },
        );
      });
      return generalResponse(res, '', FAQ_MESSAGES.FAQ_ADDED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getFaqDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { langauge } = req.query;
      const getFaq = await this.faqPageRepository.getAll({
        attributes: ['uuid', `question_${langauge}`, `answer_${langauge}`],
        order: [['created_at', 'DESC']],
      });
      return generalResponse(res, getFaq, FAQ_MESSAGES.FAQ_DATA, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSpecificFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.body;
      const getFaq = await this.faqPageRepository.get({
        where: {
          uuid: uuid,
        },
        attributes: { exclude: ['updated_at', 'deleted_at', 'created_at'] },
      });
      return generalResponse(res, getFaq, FAQ_MESSAGES.FAQ_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateFaq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.body;
      const findFaq = await this.faqPageRepository.get({
        where: {
          uuid: uuid,
        },
      });
      if (!findFaq) {
        return generalResponse(
          res,
          null,
          CMS_MESSAGES?.CMS_UNAUTHORIZE_UPDATE_REQUEST,
          responseType.FAILURE,
          true,
          200,
        );
      }
      await Faq.update(
        { ...req.body.data },
        {
          where: {
            uuid: uuid,
          },
        },
      );
      return generalResponse(res, '', FAQ_MESSAGES.FAQ_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteFaq = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;
      await this.faqPageRepository.deleteData({
        where: {
          uuid: uuid,
        },
      });
      return generalResponse(res, '', FAQ_MESSAGES.FAQ_DELETED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

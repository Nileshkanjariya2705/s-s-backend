import { NextFunction, Request, Response } from 'express';
import { generalResponse, responseType } from '@/helper/common.helper';
import { CATEGORY_MESSAGES, CMS_CONTACT_MESSAGE, CMS_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';

import CmsPages from '@/models/cmsPages.model';
import UserContactRepo from '@/repository/Cms/userContact.repository';
import db from '@/models';
import CmsPagesRepo from '@/repository/Cms/cmsPages.repository';
import BlogsDetailsRepo from '@/repository/Cms/blogDetails.repository';
import CmsReviewRepo from '@/repository/Cms/cmsReview.repository';
import FaqRepo from '@/repository/Cms/faq.repository';
import CategoryRepo from '@/repository/Category/category.repository';
import UserContact from '@/models/userFeedback.model';
import { Op } from 'sequelize';

export class CmsPagesController {
  constructor(
    private readonly cmsPagesRepository: CmsPagesRepo,
    private readonly userContactRepository: UserContactRepo,
    private readonly blogDetailsRepository: BlogsDetailsRepo,
    private readonly cmsReviewRepository: CmsReviewRepo,
    private readonly cmsFaqRepo: FaqRepo,
    private readonly categoryRepository: CategoryRepo,
  ) {}
  public readonly getCmsPages = async (req: Request, res: Response) => {
    try {
      const accountUserRole = await this.cmsPagesRepository.getAllData({});
      return generalResponse(res, accountUserRole, CMS_MESSAGES?.CMS_PAGES_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getDataSourceCount = async (req: Request, res: Response) => {
    try {
      const getCountOfBlogs = await this.blogDetailsRepository.getCount({});
      const getCountOfReview = await this.cmsReviewRepository.getCount({});
      const getCountOfFaqs = await this.cmsFaqRepo.getCount({});
      const finalResponse = {
        getCountOfBlogs,
        getCountOfReview,
        getCountOfFaqs,
      };
      return generalResponse(res, finalResponse, CMS_MESSAGES?.CMS_DATASOURCE_COUNT, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSpecificPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { cmsPageId } = req.query;

      const getSpecificPageData = await this.cmsPagesRepository.get({
        where: {
          uuid: cmsPageId as string,
        },
        attributes: ['cms_content'],
      });
      return generalResponse(
        res,
        getSpecificPageData,
        CMS_MESSAGES?.CMS_SPECIFIC_PAGE_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateReviewPage = async (req: Request, res: Response) => {
    try {
      const upadteCMSPage = await CmsPages.update(
        {
          [req.body.key]: JSON.stringify(req.body.data),
        },
        {
          where: {
            page_title: req.body.page,
          },
        },
      );
      return generalResponse(res, upadteCMSPage, CMS_MESSAGES?.CMS_PAGE_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updatedAboutUsCms = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      let key = Object.keys(req.body)[0];

      const requestedContent = JSON.parse(req.body[key]);
      let banner_section_img = [...requestedContent?.banner_section_img];
      let our_team = [...requestedContent?.our_team];
      let choose_us_card = [...requestedContent?.choose_us_card];
      if (req?.files && req?.files?.banner_section_img && req?.files?.banner_section_img.length > 0) {
        req.files.banner_section_img.forEach((item, index) => {
          const findFileIndex = banner_section_img.findIndex((fileItem) => typeof fileItem?.image !== 'string');

          if (findFileIndex !== -1) {
            banner_section_img[findFileIndex] = { image: item.filename };
          }
        });
      }
      if (req?.files && req?.files?.our_team && req?.files?.our_team.length > 0) {
        req.files.our_team.forEach((item, index) => {
          const findFileIndex = our_team.findIndex((fileItem) => typeof fileItem.image !== 'string');
          if (findFileIndex !== -1) {
            our_team[findFileIndex]['image'] = item.filename;
          }
        });
      }

      if (req?.files && req?.files?.choose_us_card && req?.files?.choose_us_card.length > 0) {
        req.files.choose_us_card.forEach((item, index) => {
          const findFileIndex = choose_us_card.findIndex((fileItem) => typeof fileItem.image !== 'string');
          if (findFileIndex !== -1) {
            choose_us_card[findFileIndex]['image'] = item.filename;
          }
        });
      }

      let newObj = {
        ...requestedContent,
        our_team: our_team,
        banner_section_img: banner_section_img,
        choose_us_card: choose_us_card,
      };
      const updateaboutUs = await CmsPages.update(
        { [key]: JSON.stringify(newObj) },

        {
          where: {
            page_title: 'About Us',
          },
        },
      );

      return generalResponse(res, 'updateaboutUs', CMS_MESSAGES?.CMS_PAGE_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getCmsPage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page_title = req.query.page_title;
      const getSpecificPageData: any = await this.cmsPagesRepository.get({
        where: {
          page_title: page_title as string,
        },
        attributes: ['cms_content_ur', 'cms_content_en', 'cms_content_ar'],
      });
      return generalResponse(
        res,
        getSpecificPageData,
        CMS_MESSAGES?.CMS_SPECIFIC_PAGE_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateHomePage = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      let key = Object.keys(req.body)[0];
      const requestedContent = JSON.parse(req.body[key]);
      let banner_section_img = [...requestedContent?.banner_section_img];
      let community_network_img = [...requestedContent?.community_network_img];
      let dynamic_section_img = [...requestedContent?.dynamic_section_img];
      let category = [...requestedContent?.category];
      let featured_products = [...requestedContent?.featured_products];
      let purchase_section_img = [...requestedContent?.purchase_section_img];

      if (req?.files && req?.files?.featured_products && req?.files?.featured_products.length > 0) {
        req.files.featured_products.forEach((item, index) => {
          const findFileIndex = featured_products.findIndex((fileItem) => typeof fileItem.image !== 'string');
          if (findFileIndex !== -1) {
            featured_products[findFileIndex]['image'] = item.filename;
          }
        });
      }
      if (req?.files && req?.files?.category && req?.files?.category.length > 0) {
        req.files.category.forEach((item, index) => {
          const findFileIndex = category.findIndex((fileItem) => typeof fileItem.image !== 'string');
          if (findFileIndex !== -1) {
            category[findFileIndex]['image'] = item.filename;
          }
        });
      }
      if (req?.files && req?.files?.banner_section_img && req?.files?.banner_section_img.length > 0) {
        req.files.banner_section_img.forEach((item, index) => {
          const findFileIndex = banner_section_img.findIndex((fileItem) => fileItem?.fileName === item.originalname);

          if (findFileIndex !== -1) {
            banner_section_img[findFileIndex] = { fileName: item.filename };
          }
        });
      }
      if (req?.files && req?.files?.purchase_section_img && req?.files?.purchase_section_img.length > 0) {
        req.files.purchase_section_img.forEach((item, index) => {
          const findFileIndex = purchase_section_img.findIndex((fileItem) => fileItem?.fileName === item.originalname);

          if (findFileIndex !== -1) {
            purchase_section_img[findFileIndex] = { fileName: item.filename };
          }
        });
      }
      if (req?.files && req?.files?.dynamic_section_img && req?.files?.dynamic_section_img.length > 0) {
        req.files.dynamic_section_img.forEach((item, index) => {
          const findFileIndex = dynamic_section_img.findIndex((fileItem) => fileItem?.fileName === item.originalname);

          if (findFileIndex !== -1) {
            dynamic_section_img[findFileIndex] = { fileName: item.filename };
          }
        });
      }
      if (req?.files && req?.files?.community_network_img && req?.files?.community_network_img.length > 0) {
        req.files.community_network_img.forEach((item, index) => {
          const findFileIndex = community_network_img.findIndex((fileItem) => fileItem?.fileName === item.originalname);

          if (findFileIndex !== -1) {
            community_network_img[findFileIndex] = { fileName: item.filename };
          }
        });
      }
      let newObj = {
        ...requestedContent,
        banner_section_img: banner_section_img,
        community_network_img: community_network_img,
        dynamic_section_img: dynamic_section_img,
        category: category,
        featured_products: featured_products,
        purchase_section_img: purchase_section_img,
      };
      const getData = await CmsPages.update(
        { [key]: JSON.stringify(newObj) },
        {
          where: {
            page_title: 'Home',
          },
        },
      );
      return generalResponse(res, '', CMS_MESSAGES?.CMS_PAGE_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateContactPage = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      let key = Object.keys(req.body)[0];
      const requestedContent = JSON.parse(req.body[key]);
      let contact = [...requestedContent?.contact];
      if (req?.files && req?.files?.contact && req?.files?.contact.length > 0) {
        req.files.contact.forEach((item, index) => {
          const findFileIndex = contact.findIndex((fileItem) => typeof fileItem.image !== 'string');

          if (findFileIndex !== -1) {
            contact[findFileIndex]['image'] = item.filename;
          }
        });
      }
      let newObj = {
        ...requestedContent,
        contact: contact,
      };
      await CmsPages.update(
        { [key]: JSON.stringify(newObj) },
        {
          where: {
            page_title: 'Contact Us',
          },
        },
      );
      return generalResponse(res, '', CMS_MESSAGES?.CMS_PAGE_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly createUserContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { firstname, lastname, email, phone, message } = req.body;
      const result = await db.transaction(async (t) => {
        const createUserContactInfo = await this.userContactRepository.createUserContactDetail(
          {
            data: {
              firstname: firstname,
              lastname: lastname,
              email: email,
              phone: phone,
              message: message,
            },
            action: 'create',
          },
          { transaction: t },
        );
      });
      return generalResponse(res, '', CMS_CONTACT_MESSAGE.MESSAGE_SENT, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAboutUsBlogs = async (req: Request, res: Response) => {
    try {
      const { langauge } = req.body;
      const getAboutUsBlogs = await this.blogDetailsRepository.getAll({
        attributes: ['uuid', `title_${langauge}`, `body_${langauge}`, 'cover_image', 'created_at', 'slug'],
        limit: 4,
      });
      return generalResponse(
        res,
        getAboutUsBlogs,
        CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getHomePageBlogs = async (req: Request, res: Response) => {
    try {
      const { langauge } = req.body;
      const getAboutUsBlogs = await this.blogDetailsRepository.getAll({
        attributes: ['uuid', `title_${langauge}`, `body_${langauge}`, 'cover_image', 'created_at', 'slug'],
        limit: 3,
      });
      return generalResponse(
        res,
        getAboutUsBlogs,
        CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getContactPageBlogs = async (req: Request, res: Response) => {
    try {
      const { langauge } = req.body;
      const getContactBlogs = await this.blogDetailsRepository.getAll({
        attributes: ['uuid', `title_${langauge}`, `body_${langauge}`, 'cover_image', 'created_at', 'slug'],
        limit: 3,
      });
      return generalResponse(
        res,
        getContactBlogs,
        CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAboutUsReviews = async (req: Request, res: Response) => {
    try {
      const reviews = await this.cmsReviewRepository.getAllData({
        limit: 4,
      });
      return generalResponse(res, reviews, CMS_MESSAGES?.CMS_REVIEW_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getHomePageReviews = async (req: Request, res: Response) => {
    try {
      const reviews = await this.cmsReviewRepository.getAllData({
        limit: 4,
      });
      return generalResponse(res, reviews, CMS_MESSAGES?.CMS_REVIEW_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSingleCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { categoryId } = req.params;
      const singleCategory = await this.categoryRepository.get({
        where: { uuid: categoryId },
        attributes: ['image'],
      });
      // const singleProductInfo = singleProduct.toJSON();
      return generalResponse(res, singleCategory, CMS_MESSAGES.CATEGORY_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAllCategories = async (req: Request, res: Response) => {
    try {
      const { lang } = req.query;
      await db.transaction(async (t) => {
        const categoryList = await this.categoryRepository.getActiveCategory(['name', 'uuid', 'name_ar', 'name_ur'], {
          transaction: t,
        });
        const categoryListInfo = [];
        if (categoryList) {
          switch (lang) {
            case 'cms_content_ar':
              categoryList.rows.forEach((data) => {
                categoryListInfo.push({
                  label: data['name_ar'],
                  value: data['uuid'],
                });
              });
              break;
            case 'cms_content_ur':
              categoryList.rows.forEach((data) => {
                categoryListInfo.push({
                  label: data['name_ur'],
                  value: data['uuid'],
                });
              });
              break;
            default:
              categoryList.rows.forEach((data) => {
                categoryListInfo.push({
                  label: data['name'],
                  value: data['uuid'],
                });
              });
              break;
          }
        }
        return generalResponse(
          res,
          categoryListInfo,
          CATEGORY_MESSAGES?.CATEGORY_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getUserContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { limit, page, isAsc, sort, searchText } = apiParams as {
        limit: string;
        page: string;
        isAsc: string;
        sort: string;
        searchText: string;
      };

      let order;
      const isOrderAsc = isAsc === 'true';
      if (sort === 'firstname' || sort === 'lastname' || sort === 'email' || sort === 'phone') {
        order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
      } else {
        order = [['created_at', 'DESC']];
      }

      let search = searchText;
      let srch = {};
      if (search) {
        srch = {
          [Op.or]: [
            {
              firstname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              lastname: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              phone: {
                [Op.like]: `%${search}%`,
              },
            },
            {
              email: {
                [Op.like]: `%${search}%`,
              },
            },
          ],
        };
      }

      const getUserContact = await this.userContactRepository.getAllData({
        attributes: {
          exclude: ['updated_at', 'deleted_at', 'created_at'],
        },
        where: { ...srch },
        order: order,
        limit: +limit,
        offset: +(Number(page) - 1) * +limit,
      });
      return generalResponse(res, getUserContact, CMS_CONTACT_MESSAGE.FETCH_DATA, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleUserContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userContactId } = req.params;
      const getSingleUserContactData = await this.userContactRepository.get({
        where: { uuid: userContactId },
        attributes: { exclude: ['updated_at', 'created_at', 'deleted_at'] },
      });
      return generalResponse(
        res,
        getSingleUserContactData,
        CMS_CONTACT_MESSAGE.FETCH_DATA,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteUserContact = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userContactId } = req.params;
      const deleteUserContact = await UserContact.destroy({ where: { uuid: userContactId } });
      return generalResponse(
        res,
        deleteUserContact,
        CMS_CONTACT_MESSAGE.CONTACT_DELETED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

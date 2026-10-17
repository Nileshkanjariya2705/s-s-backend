import { Request, Response } from 'express';
import { generalResponse, responseType } from '@/helper/common.helper';
import { Op } from 'sequelize';
import { CMS_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';

import BlogsDetails from '@/models/blogDetails.model';
import BlogsDetailsRepo from '@/repository/Cms/blogDetails.repository';
import CmsPages from '@/models/cmsPages.model';
import CmsPagesRepo from '@/repository/Cms/cmsPages.repository';

export class BlogsController {
  constructor(
    private readonly blogDetailsRepository: BlogsDetailsRepo,
    private readonly cmsPagesRepository: CmsPagesRepo,
  ) {}
  public readonly updateBlogsHeader = async (req: Request, res: Response) => {
    try {
      const { data, lang } = req.body;
      const parsedBlogs = JSON.parse(data);
      await CmsPages.update(
        { [`cms_content_${lang}`]: JSON.stringify(parsedBlogs) },
        {
          where: {
            page_title: 'Blog',
          },
        },
      );
      return generalResponse(res, parsedBlogs, CMS_MESSAGES?.CMS_PAGE_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getRelatedBlogs = async (req: Request, res: Response) => {
    try {
      const { langauge } = req.body;
      const getAboutUsBlogs = await this.blogDetailsRepository.getAll({
        attributes: ['uuid', `title_${langauge}`, `body_${langauge}`, 'cover_image', 'created_at', 'slug'],
        limit: 3,
        order: [['created_at', 'DESC']],
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

  public readonly getBlogs = async (req: Request, res: Response) => {
    try {
      const { langauge, apiParams } = req.body;
      const getAllBlogs = await this.blogDetailsRepository.getAllData({
        attributes: ['uuid', `title_${langauge}`, `body_${langauge}`, 'cover_image', 'created_at', 'slug'],
        order: [['created_at', 'DESC']],
        limit: apiParams && +apiParams.limit,
        offset: apiParams && (+apiParams.page - 1) * +apiParams.limit,
      });

      return generalResponse(res, getAllBlogs, CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSingleBlogsBySlug = async (req: Request, res: Response) => {
    try {
      const slug = req.body.slug;
      const getAllBlogs = await this.blogDetailsRepository.getAll({
        attributes: [
          'uuid',
          `title_en`,
          `body_en`,
          `author_name_en`,
          `title_ar`,
          `body_ar`,
          `author_name_ar`,
          `title_ur`,
          `body_ur`,
          `author_name_ur`,
          'cover_image',
          'created_at',
          'author_image',
          'slug',
        ],
        where: {
          slug: slug,
        },
      });
      return generalResponse(res, getAllBlogs, CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSingleBlog = async (req: Request, res: Response) => {
    try {
      const uuid = req.body.uuid;
      const getAllBlogs = await this.blogDetailsRepository.getAll({
        attributes: [
          'uuid',
          `title_en`,
          `body_en`,
          `author_name_en`,
          `title_ar`,
          `body_ar`,
          `author_name_ar`,
          `title_ur`,
          `body_ur`,
          `author_name_ur`,
          'cover_image',
          'created_at',
          'author_image',
          'slug',
        ],
        where: {
          uuid: uuid,
        },
      });
      return generalResponse(res, getAllBlogs, CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly createBlog = async (req: any, res: Response) => {
    try {
      const slug = req.body.slug;
      const checkSlugExist = await this.blogDetailsRepository.get({
        where: {
          slug: slug,
        },
      });

      if (checkSlugExist) {
        return generalResponse(res, null, CMS_MESSAGES.SLUG_EXISTS, responseType.FAILURE, true, 200);
      }
      const createBlog = await this.blogDetailsRepository.create({
        [`title_en`]: req.body[`title_en`],
        [`body_en`]: req.body[`body_en`],
        [`author_name_en`]: req.body[`author_name_en`],
        [`title_ar`]: req.body[`title_ar`],
        [`body_ar`]: req.body[`body_ar`],
        [`author_name_ar`]: req.body[`author_name_ar`],
        [`title_ur`]: req.body[`title_ur`],
        [`body_ur`]: req.body[`body_ur`],
        [`author_name_ur`]: req.body[`author_name_ur`],
        author_image: req.files[`author_image`][0].filename,
        cover_image: req.files[`cover_image`][0].filename,
        slug: req.body.slug,
      });
      return generalResponse(res, createBlog, CMS_MESSAGES?.CMS_CREATED_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateBlog = async (req: any, res: Response) => {
    try {
      const { uuid } = req.body;
      const findBlog = await this.blogDetailsRepository.get({
        where: {
          uuid: uuid,
        },
        raw: true,
      });
      if (!findBlog) {
        return generalResponse(
          res,
          null,
          CMS_MESSAGES?.CMS_UNAUTHORIZE_UPDATE_REQUEST,
          responseType.FAILURE,
          true,
          200,
        );
      }
      const slug = req.body.slug;
      const checkSlugExist = await this.blogDetailsRepository.get({
        where: {
          slug: slug,
          uuid: {
            [Op.not]: uuid,
          },
        },
      });
      if (checkSlugExist) {
        return generalResponse(res, null, CMS_MESSAGES.SLUG_EXISTS, responseType.FAILURE, true, 200);
      }
      const createBlog = await BlogsDetails.update(
        {
          author_image: req?.body?.author_image
            ? req.body.author_image !== 'null'
              ? findBlog.author_image
              : null
            : req.files.author_image[0].filename,
          cover_image: req?.body?.cover_image
            ? req?.body?.cover_image !== 'null'
              ? findBlog.cover_image
              : null
            : req.files.cover_image[0].filename,

          [`title_en`]: req.body[`title_en`],
          [`body_en`]: req.body[`body_en`],
          [`author_name_en`]: req.body[`author_name_en`],

          [`title_ar`]: req.body[`title_ar`],
          [`body_ar`]: req.body[`body_ar`],
          [`author_name_ar`]: req.body[`author_name_ar`],

          [`title_ur`]: req.body[`title_ur`],
          [`body_ur`]: req.body[`body_ur`],
          [`author_name_ur`]: req.body[`author_name_ur`],
          slug: req.body.slug,
        },
        { where: { uuid: uuid } },
      );
      return generalResponse(res, createBlog, CMS_MESSAGES?.CMS_UPDATE_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly deleteBlog = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;

      const findBlog = await this.blogDetailsRepository.get({
        where: {
          uuid: uuid,
        },
      });
      if (!findBlog) {
        return generalResponse(
          res,
          null,
          CMS_MESSAGES?.CMS_UNAUTHORIZE_UPDATE_REQUEST,
          responseType.FAILURE,
          true,
          200,
        );
      }
      const createBlog = await this.blogDetailsRepository.deleteData({
        where: {
          uuid: uuid,
        },
      });
      return generalResponse(res, createBlog, CMS_MESSAGES?.CMS_DELETED_SUCCESSFUL, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly uploadBlogImage = async (req: any, res: Response) => {
    try {
      const image = req.file.filename;
      return generalResponse(res, image, CMS_MESSAGES.BLOG_IMAGE_UPLOAD, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

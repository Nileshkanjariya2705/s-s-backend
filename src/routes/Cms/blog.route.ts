import { Router } from 'express';

import { Routes } from '@/interfaces/routes.interface';

import { BlogsController } from '@/controllers/Cms/blogs.controller';

import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import BlogsDetailsRepo from '@/repository/Cms/blogDetails.repository';
import CmsPagesRepo from '@/repository/Cms/cmsPages.repository';
import { verifyToken } from '@/helper/auth.helper';
import validationMiddleware from '@/middlewares/validation.middleware';
import {
  createBlogHeaderSchema,
  createBlogSchema,
  deleteBlogSchema,
  getSingleBlogSchema,
} from '@/validationSchema/blogs.validation.schema';

class CmsBlogRoute implements Routes {
  public path = '/blog';
  public router = Router();
  public blogsController = new BlogsController(new BlogsDetailsRepo(), new CmsPagesRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/update-header`).post(
      verifyToken,
      (req, res, next) => {
        const requestedContent = JSON.parse(req.body.data);
        const { error } = createBlogHeaderSchema.validate(requestedContent, { abortEarly: false });
        if (error) {
          return res.status(400).json({ error: error.details.map((err) => err.message) });
        }
        next();
      },
      this.blogsController.updateBlogsHeader,
    );
    this.router.route(`${this.path}/blog-details/related-blog`).post(this.blogsController.getRelatedBlogs);

    this.router
      .route(`${this.path}`)
      .post(validationMiddleware(getSingleBlogSchema, 'body'), this.blogsController.getSingleBlogsBySlug);
    this.router
      .route(`${this.path}/get-single`)
      .post(validationMiddleware(getSingleBlogSchema, 'body'), this.blogsController.getSingleBlog);
    this.router.route(`${this.path}/blog-list`).post(this.blogsController.getBlogs);
    this.router.route(`${this.path}/create`).post(
      uploadMedia.fields([
        { name: 'cover_image', maxCount: 1 },
        { name: 'author_image', maxCount: 1 },
      ]),
      validationMiddleware(createBlogSchema, 'body'),
      verifyToken,
      this.blogsController.createBlog,
    );
    this.router.route(`${this.path}/update`).post(
      uploadMedia.fields([
        { name: 'cover_image', maxCount: 1 },
        { name: 'author_image', maxCount: 1 },
      ]),
      verifyToken,
      validationMiddleware(createBlogSchema, 'body'),
      this.blogsController.updateBlog,
    );
    this.router
      .route(`${this.path}/image`)
      .post(uploadMedia.single('BlogImage'), verifyToken, this.blogsController.uploadBlogImage);
    this.router
      .route(`${this.path}/delete/:uuid`)
      .delete(validationMiddleware(deleteBlogSchema, 'params'), verifyToken, this.blogsController.deleteBlog);
  }
}

export default CmsBlogRoute;

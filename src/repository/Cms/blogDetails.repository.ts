import { setInstance } from '@/helper/sequelize.helper';
import db from '@/models';
import BaseRepository from '../base.repository';
import { BuildCmsBlogsArgs } from '@/interfaces/Blogs/cmsBlogs.interface';
import BlogsDetails from '@/models/blogDetails.model';

export default class BlogsDetailsRepo extends BaseRepository<BlogsDetails> {
  constructor() {
    super(BlogsDetails.name);
  }
  readonly updateBlogDetails = async (cmsBlogArgs: Required<BuildCmsBlogsArgs>) => {
    const { data, cms } = cmsBlogArgs;
    return db.transaction(async (transaction) => {
      const buildCms = setInstance({ ...data }, cms);
      await buildCms.save({ transaction });
      return buildCms;
    });
  };
}

import BlogsDetails from '@/models/blogDetails.model';
import { Request } from 'express';

export interface BuildCmsBlogsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  //   user?: Users;
  cms?: BlogsDetails;
}

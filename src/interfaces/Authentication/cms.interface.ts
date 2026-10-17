import CmsPages from '@/models/cmsPages.model';
import { Request } from 'express';

export interface BuildCmsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  //   user?: Users;
  cms?: CmsPages;
}

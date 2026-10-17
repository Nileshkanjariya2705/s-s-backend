import CmsReview from '@/models/cmsReview.model';
import { Request } from 'express';

export interface BuildCmsReviewArgs {
  data: Request['body'];
  // action: 'create' | 'update';
  cmsReview?: CmsReview;
}

import StoreProductReviews from '@/models/storeProductReviews.model';
import { Request } from 'express';

export interface BuildStoreProdReviewsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  review?: StoreProductReviews;
}

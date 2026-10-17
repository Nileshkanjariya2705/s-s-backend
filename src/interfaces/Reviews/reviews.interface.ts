import Reviews from '@/models/reviews.model';
import { Request } from 'express';

export interface BuildReviewsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  review?: Reviews;
}

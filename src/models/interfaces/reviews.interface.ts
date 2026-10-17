import { RequiredKey } from './common.interface';
export interface ReviewsAttributes {
  uuid: string;

  purchase_request_uuid: string;

  order_uuid: string;

  supplier_info_uuid: string;

  reviews: string;

  rating: number;

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredReviewsAttributes = RequiredKey<ReviewsAttributes, 'uuid'>;

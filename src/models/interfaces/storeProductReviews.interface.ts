import { RequiredKey } from './common.interface';
export interface StoreProductReviewsAttributes {
  uuid: string;

  product_uuid: string;

  review_by: string;

  supplier_info_uuid: string;

  store_info_uuid: string;

  reviews: string;

  rating: number;

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredStoreProductReviews = RequiredKey<StoreProductReviewsAttributes, 'uuid'>;

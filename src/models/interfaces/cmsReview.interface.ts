import { RequiredKey } from './common.interface';
export interface CmsReviewAttributes {
  uuid: string;
  rating: number;
  card_description_eng: string;
  customer_name_eng: string;
  customer_designation_eng: string;
  card_description_arabic: string;
  customer_name_arabic: string;
  customer_designation_arabic: string;
  card_description_urdu: string;
  customer_name_urdu: string;
  customer_designation_urdu: string;
  profile_image: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredCmsReviewAttributes = RequiredKey<CmsReviewAttributes, 'uuid'>;

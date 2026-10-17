import Measurement from '../measurement.model';
import { RequiredKey } from './common.interface';
export interface ProductsAttributes {
  measurement: Measurement;
  uuid: string;
  name_en: string;
  name_ar: string;
  name_ur: string;
  overview_en: string;
  overview_ur: string;
  overview_ar: string;
  description_en: string;
  description_ar: string;
  description_ur: string;
  specification_en: string;
  specification_ar: string;
  specification_ur: string;
  category_uuid: string;
  measurement_uuid: string;
  images: string;
  featured_image: string;
  status: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredProductsAttributes = RequiredKey<ProductsAttributes, 'uuid'>;

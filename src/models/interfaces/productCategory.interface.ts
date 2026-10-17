import { RequiredKey } from './common.interface';
export interface ProductCategoryAttributes {
  uuid: string;
  name: string;
  slug: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredProductCategoryAttributes = RequiredKey<ProductCategoryAttributes, 'uuid'>;

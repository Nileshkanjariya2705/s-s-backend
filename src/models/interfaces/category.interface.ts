import Products from '../products.model';
import { RequiredKey } from './common.interface';
export interface CategoryAttributes {
  products: Products[];
  uuid: string;

  name: string;

  name_ar:string;
  name_ur:string

  status: string;

  image: string;

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredCategoryAttributes = RequiredKey<CategoryAttributes, 'uuid'>;

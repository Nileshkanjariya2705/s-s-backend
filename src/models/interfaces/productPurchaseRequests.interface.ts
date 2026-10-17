import Products from '../products.model';
import { RequiredKey } from './common.interface';
export interface PurchaseRequestProductAttributes {
  products: Products;
  uuid: string;
  purchase_request_uuid: string;
  product_uuid: string;
  category_uuid: string;
  requested_price: number;
  requested_quantity: number;
  description: string;
  allow_other_brands: boolean;
  is_purchased: boolean;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredPurchaseRequestProductAttributes = RequiredKey<PurchaseRequestProductAttributes, 'uuid'>;

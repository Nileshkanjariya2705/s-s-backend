import { RequiredKey } from './common.interface';
export interface SupplierProductQuotesAttributes {
  otherBrandProduct: any;
  uuid: string;
  supplier_quotes_uuid: string;
  purchase_request_products_uuid: string;
  is_approved: boolean;
  offered_quantity: number;
  offered_price: string;
  other_brand_product_uuid: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredSupplierProductQuotesAttributes = RequiredKey<SupplierProductQuotesAttributes, 'uuid'>;

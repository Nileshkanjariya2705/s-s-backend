import SupplierProductQuotes from '../supplierProductQuotes.model';
import { RequiredKey } from './common.interface';
export interface OrderProductsReplaceRequestAttributes {
  uuid: string;
  order_uuid: string;
  order_replace_requests_uuid: string;
  order_product_uuid: string;
  rejection_reason: string;
  replacement_product_status: string;
  product_uuid: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredOrderProductsReplaceRequestAttributes = RequiredKey<OrderProductsReplaceRequestAttributes, 'uuid'>;

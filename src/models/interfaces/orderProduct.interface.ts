import SupplierProductQuotes from '../supplierProductQuotes.model';
import { RequiredKey } from './common.interface';
export interface OrderProductsAttributes {
  supplierProductQuotes: SupplierProductQuotes;
  uuid: string;
  order_id: string;
  quote_id: string;
  entity_type: string;
  entity_id: string;
  price: string;
  quantity: number;
  product_uuid: string;
  replacement_reason: string;
  replacement_request: boolean;
  refund_request: boolean;
  refund_reason: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredOrderProductsAttributes = RequiredKey<OrderProductsAttributes, 'uuid'>;

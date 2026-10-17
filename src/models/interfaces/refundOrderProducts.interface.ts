import { RequiredKey } from './common.interface';
export interface RefundOrderProductsAttributes {
  uuid: string;
  refund_order_uuid: string;
  order_uuid: string;
  order_product_uuid: string;
  product_uuid: string;
  reason: string;
  refund_product_status: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredRefundOrderProductsAttributes = RequiredKey<RefundOrderProductsAttributes, 'uuid'>;

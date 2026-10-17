import { RequiredKey } from './common.interface';
export interface OrderReplacementAttributes {
  uuid: string;
  order_id: string;
  status: boolean;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredOrderProductsAttributes = RequiredKey<OrderReplacementAttributes, 'uuid'>;

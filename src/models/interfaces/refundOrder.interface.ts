import StoreInfo from '../storesInfo.model';
import User from '../user.model';
import { RequiredKey } from './common.interface';
export interface RefundOrdersAttributes {
  uuid: string;
  order_uuid:string;
  refundable_amount:number
  order_amount_left:number
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredRefundOrdersAttributes = RequiredKey<RefundOrdersAttributes, 'uuid'>;

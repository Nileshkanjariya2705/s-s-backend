import { RequiredKey } from './common.interface';
export interface OrderReplacementRequestsAttributes {
  uuid: string;
  order_id: string;

}

export type RequiredOrderReplacementRequestsAttributes = RequiredKey<OrderReplacementRequestsAttributes, 'uuid'>;

import Orders from '@/models/orders.model';
import { Request } from 'express';

export interface BuildOrderRequestArgs {
  data: Request['body'];
  action: 'create' | 'update';
  orderData?: Orders;
}

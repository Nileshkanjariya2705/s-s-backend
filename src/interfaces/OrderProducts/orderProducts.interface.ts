import OrderProducts from '@/models/orderProduct.model';
import { Request } from 'express';

export interface BuildOrderProductRequestArgs {
  data: Request['body'];
  action: 'create' | 'update';
  orderProduct?: OrderProducts;
}

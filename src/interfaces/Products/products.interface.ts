import Products from '@/models/products.model';
import { Request } from 'express';

export interface BuildProductsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  Products?: Products;
}

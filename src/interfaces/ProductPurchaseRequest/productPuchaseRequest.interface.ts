import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import { Request } from 'express';

export interface BuildProductPurchaseRequestsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  productPurchaseRequest?: PurchaseRequestProducts;
}

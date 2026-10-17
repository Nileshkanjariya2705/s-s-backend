import PurchaseRequests from '@/models/purchaseRequest.model';
import { Request } from 'express';

export interface BuildPurchaseRequestsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  purchaseReq?: PurchaseRequests;
}

import StoreInfo from '@/models/storesInfo.model';
import { Request } from 'express';

export interface BuildStoreInfoArgs {
  data: Request['body'];
  action: 'create' | 'update';
  StoreInfo?: StoreInfo;
}

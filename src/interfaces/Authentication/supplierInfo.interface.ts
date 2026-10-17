import SupplierInfo from '@/models/supplierinfo.model';
import { Request } from 'express';

export interface BuildSupplierInfoArgs {
  data: Request['body'];
  action: 'create' | 'update';
  user?: SupplierInfo;
}

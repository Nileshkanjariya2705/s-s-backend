import SupplierProducts from '@/models/supplierProducts.model';
import { Request } from 'express';

export interface BuildSuppplierProductsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  SupplierProducts?: SupplierProducts;
}

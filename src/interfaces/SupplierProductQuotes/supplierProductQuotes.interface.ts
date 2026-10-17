import SupplierProducts from '@/models/supplierProducts.model';

export interface BuildSupplierProductsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  supplierProducts?: SupplierProducts;
}

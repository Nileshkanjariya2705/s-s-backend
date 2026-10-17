import { RequiredKey } from './common.interface';
export interface SupplierProductsAttributes {
  uuid: string;
  product_uuid: string;
  supplier_uuid: string;
  supplier_info_uuid: string;
  price: string;
  base_price: string;
  units: string;
  charges: number;
  is_purchaseable: boolean;
  created_at: number;
  updated_at: number;
  end_date: number;
  deleted_at: number;
}

export type RequiredSupplierProductsAttributes = RequiredKey<SupplierProductsAttributes, 'uuid'>;

import { RequiredKey } from './common.interface';
export interface SupplierInfoAttributes {
  uuid: string;
  company_name: string;
  cr_number: string;
  tax_number: string;
  iban_number: string;
  address: string;
  is_verified: boolean;
  is_active: boolean;
  created_at: number;
  updated_at?: number;
  deleted_at?: number;
  Ord_Commission: number;
  Bank_Commission: number;
}

export type RequiredSupplierInfoAttributes = RequiredKey<SupplierInfoAttributes, 'uuid'>;

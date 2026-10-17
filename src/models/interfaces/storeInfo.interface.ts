import { RequiredKey } from './common.interface';
export interface StoreInfoAttributes {
  uuid: string;
  company_name: string;
  cr_number: string;
  tax_number: string;
  iban_number: string;
  address: string;
  is_verified: boolean;
  created_at: number;
  updated_at?: number;
  deleted_at?: number;
  is_active?: boolean;
}

export type RequiredStoreInfoAttributes = RequiredKey<StoreInfoAttributes, 'uuid'>;

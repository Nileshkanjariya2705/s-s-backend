import { RequiredKey } from './common.interface';
export interface SupplierAdminReportsAttributes {
  uuid: string;

  supplier_info_uuid: string;

  month: number;

  year: number;

  file: string;

  sheets: string;

  status: string;

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredSupplierAdminReportsAttributes = RequiredKey<SupplierAdminReportsAttributes, 'uuid'>;

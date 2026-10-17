import { RequiredKey } from './common.interface';
export interface AdminSettingsAttributes {
  uuid: string;

  vat_percentage: number;

  replacement_days: number;

  refundable_days: number;

  default_ord_commission: number;

  default_bank_commission:number;

  current_active:boolean

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredAdminSettingsAttributes = RequiredKey<AdminSettingsAttributes, 'uuid'>;

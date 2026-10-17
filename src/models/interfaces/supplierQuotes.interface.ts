import { RequiredKey } from './common.interface';
export interface SupplierQuotesAttributes {
  uuid: string;
  purchase_request_uuid: string;
  supplier_info_uuid: string;
  quoted_by: string;
  is_paid: boolean;
  charges_and_total: number;
  charges:number;
  created_at: number;
  updated_at: number;
  deleted_at: number;
  payment_method: string;
}

export type RequiredSupplierQuotesAttributes = RequiredKey<SupplierQuotesAttributes, 'uuid'>;

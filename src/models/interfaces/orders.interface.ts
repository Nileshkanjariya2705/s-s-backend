import StoreInfo from '../storesInfo.model';
import User from '../user.model';
import { RequiredKey } from './common.interface';
export interface OrderAttributes {
  user: User;
  uuid: string;
  created_by: string;
  purchase_request_id: string;
  address_id: string;
  additional_info: string;
  status: string;
  payment_mode: string;
  store_info_uuid: string;
  supplier_info_uuid: string;
  payment_receipt: string;
  vat_percentage: number;
  reason_for_cancel: string;
  is_mail_sent: boolean;
  replacement_request: boolean;
  replacement_status: string;
  refund_request: boolean;
  refund_accepted_admin: boolean;
  refund_accepted_supplier: string;
  amount_without_vat:number
  branch_uuid:string
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredOrderAttributes = RequiredKey<OrderAttributes, 'uuid'>;

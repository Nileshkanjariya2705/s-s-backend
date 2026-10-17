import { RequiredKey } from './common.interface';
export interface PurchaseRequestAttributes {
  uuid: string;
  requester_uuid: string;
  store_info_uuid: string;
  supplier_info_uuid: string;
  quotes_accepted_upto: string;
  total_price: string;
  status: string;
  is_closed: boolean;
  offer_for_entire_request: boolean;
  address_uuid:string
  branch_uuid:string
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export type RequiredPurchaseRequestAttributes = RequiredKey<PurchaseRequestAttributes, 'uuid'>;

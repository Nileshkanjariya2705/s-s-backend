import { RequiredKey } from './common.interface';
export interface ChatAttributes {
  message: any;
  uuid: string;
  order_uuid: string;
  supplier_info_uuid: string;
  store_info_uuid: string;
  status: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredChatAttributes = RequiredKey<ChatAttributes, 'uuid'>;

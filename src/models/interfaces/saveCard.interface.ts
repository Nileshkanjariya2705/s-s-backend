import { RequiredKey } from './common.interface';
export interface SaveCardAttributes {
  uuid: string;

  store_info_uuid: string;

  user_uuid: string;

  token_id: string;

  card_id: string;

  customer_id: string;

  card_name: string;

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredSaveCardAttributes = RequiredKey<SaveCardAttributes, 'uuid'>;

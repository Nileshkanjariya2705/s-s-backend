import { RequiredKey } from './common.interface';
export interface AccountUser {
  store_uuid: any;
  user?: any;
  uuid: string;

  entity_type: string;

  entity_uuid: string;

  user_uuid: string;

  role_uuid: string;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredAccountUser = RequiredKey<AccountUser, 'uuid'>;

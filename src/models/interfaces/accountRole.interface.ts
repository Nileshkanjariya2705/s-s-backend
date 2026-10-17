import { RequiredKey } from './common.interface';
export interface AccountRole {
  uuid: string;

  entity_type: string;

  entity_uuid: string;

  user_uuid: string;

  role_uuid: string;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredAccountRolesAttributes = RequiredKey<AccountRole, 'uuid'>;

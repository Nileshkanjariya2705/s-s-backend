import { RequiredKey } from './common.interface';
export interface PermissionsAttributes {
  uuid: string;
  name: string;
  slug: string;
  permission_owner: string;
  permission_type: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredPermissionsAttributes = RequiredKey<PermissionsAttributes, 'uuid'>;

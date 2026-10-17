import { RequiredKey } from './common.interface';
export interface RolePermissionsAttributes {
  uuid: string;
  store_role_uuid: string;
  permission_uuid: string;
  role_uuid: string;
}

export type RequiredRolePermissionsAttributesAttributes = RequiredKey<RolePermissionsAttributes, 'uuid'>;

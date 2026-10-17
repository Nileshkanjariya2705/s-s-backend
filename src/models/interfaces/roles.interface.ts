import { RequiredKey } from './common.interface';
export interface RolesAttributes {
  uuid: string;
  name: string;
  name_ar: string;
  name_ur: string;
  slug: string;
  status: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredRolesAttributes = RequiredKey<RolesAttributes, 'uuid'>;

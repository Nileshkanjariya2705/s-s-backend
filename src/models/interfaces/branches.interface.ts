import { RequiredKey } from './common.interface';
export interface BranchAttributes {
  uuid: string;

  entity_type: string;

  entity_uuid: string;

  name: string;

  address: string;

  city: string;

  state: string;

  country: string;

  phone: number;

  status: string;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredBranchAttributes = RequiredKey<BranchAttributes, 'uuid'>;

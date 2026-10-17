import { RequiredKey } from './common.interface';
export interface AddressAttributes {
  uuid: string;

  user_uuid: string;

  entity_info_uuid: string;

  entity_type: string;

  address: string;

  city: string;

  state: string;

  country: string;

  postal_code: number;

  phone: number;

  branch_uuid:string

  is_default: boolean;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredAddressAttributes = RequiredKey<AddressAttributes, 'uuid'>;

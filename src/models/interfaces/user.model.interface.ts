import { RequiredKey } from './common.interface';
export interface UserAttributes {
  uuid: string;

  email: string;

  username: string;

  password: string;

  image: string;

  phone: bigint;

  is_active: boolean;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredUserAttributes = RequiredKey<UserAttributes, 'uuid'>;

import { RequiredKey } from './common.interface';
export interface UserContactAttributes {
  uuid: string;
  email: string;
  firstname: string;
  lastname: string;
  phone: bigint;
  message: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredUserConatactAttributes = RequiredKey<UserContactAttributes, 'uuid'>;

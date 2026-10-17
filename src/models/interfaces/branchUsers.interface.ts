import { RequiredKey } from './common.interface';
export interface BranchUsersAttributes {
  uuid: string;

  user_uuid: string;

  branch_uuid: string;

  status: string;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredBranchUsersAttributes = RequiredKey<BranchUsersAttributes, 'uuid'>;

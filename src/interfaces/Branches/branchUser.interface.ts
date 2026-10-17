import BranchUsers from '@/models/branchUser.model';
import { Request } from 'express';

export interface BuildBranchUsersArgs {
  data: Request['body'];
  action: 'create' | 'update';
  BranchUsers?: BranchUsers;
}

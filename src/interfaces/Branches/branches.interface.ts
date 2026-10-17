import Branch from '@/models/branches.model';
import { Request } from 'express';

export interface BuildBranchArgs {
  data: Request['body'];
  action: 'create' | 'update';
  Branch?: Branch;
}

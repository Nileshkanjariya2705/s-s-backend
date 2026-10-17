import Roles from '@/models/roles.model';
import { Request } from 'express';

export interface BuildRoleArgs {
  data: Request['body'];
  action: 'create' | 'update';
  role?: Roles;
}

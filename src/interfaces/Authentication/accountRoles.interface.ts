import AccountRoles from '@/models/accountRoles.model';
import { Request } from 'express';

export interface BuildAccountRoleArgs {
  data: Request['body'];
  action: 'create' | 'update';
  accountRole?: AccountRoles;
}

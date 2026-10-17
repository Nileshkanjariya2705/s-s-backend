import AccountUsers from '@/models/accountUsers.model';
import { Request } from 'express';

export interface BuildAccountUsersArgs {
  data: Request['body'];
  action: 'create' | 'update';
  user?: AccountUsers;
}

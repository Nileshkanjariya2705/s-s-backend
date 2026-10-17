import Users from '@/models/user.model';
import { Request } from 'express';

export interface BuildAccountArgs {
  data: Request['body'];
  action: 'create' | 'update';
  user?: Users;
}

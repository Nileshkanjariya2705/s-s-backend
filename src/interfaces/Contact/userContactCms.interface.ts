import UserContact from '@/models/userFeedback.model';
import { Request } from 'express';

export interface BuildCmsUserContactArgs {
  data: Request['body'];
  action: 'create' | 'update';
  userContact?: UserContact;
}

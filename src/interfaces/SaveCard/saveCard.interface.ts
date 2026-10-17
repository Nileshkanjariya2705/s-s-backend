import SaveCard from '@/models/saveCard.model';
import { Request } from 'express';

export interface BuildSaveCardArgs {
  data: Request['body'];
  action: 'create' | 'update';
  saveCard?: SaveCard;
}

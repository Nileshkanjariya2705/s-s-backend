import Faq from '@/models/faq.model';
import { Request } from 'express';

export interface BuildCmsFaqArgs {
  data: Request['body'];
  // action: 'create' | 'update';
  faq?: Faq;
}

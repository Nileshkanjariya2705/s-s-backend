import SupportTicket from '@/models/supportTicket.model';
import { Request } from 'express';

export interface BuildSupportTicketArgs {
  data: Request['body'];
  action: 'create' | 'update';
  supportTicket?: SupportTicket;
}

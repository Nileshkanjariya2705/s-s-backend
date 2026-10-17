import SupportTicketMessages from '@/models/supportTicketMessages.model';
import { Request } from 'express';

export interface BuildSupportTicketMessageArgs {
  data: Request['body'];
  action: 'create' | 'update';
  SupportTicketMessage?: SupportTicketMessages;
}

import { RequiredKey } from './common.interface';
export interface SupportTicketMessagesAttributes {
  uuid: string;
  support_ticket_uuid: string;
  user_uuid: string;
  text: string;
  attachment: string;
  created_at: Date;
  updated_at: number;
  deleted_at: number;
}

export type RequiredSupportTicketMessagesAttributes = RequiredKey<SupportTicketMessagesAttributes, 'uuid'>;

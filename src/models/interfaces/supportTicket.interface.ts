import StoreInfo from '../storesInfo.model';
import SupplierInfo from '../supplierinfo.model';
import SupportTicketMessages from '../supportTicketMessages.model';
import User from '../user.model';
import { RequiredKey } from './common.interface';
export interface SupportTicketAttributes {
  store_uuid: StoreInfo;
  supplier_uuid: SupplierInfo;
  user: User;
  supportTicketMessages: SupportTicketMessages[];
  uuid: string;
  entity_type: string;
  entity_uuid: string;
  admin_uuid: string;
  subject: string;
  admin_last_read: number;
  client_last_read: number;
  ticket_number: number;
  status: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredSupportTicketAttributes = RequiredKey<SupportTicketAttributes, 'uuid'>;

import { RequiredKey } from './common.interface';
export interface MessagesAttributes {
  uuid: string;
  chat_uuid: string;
  user_uuid: string;
  message: string;
  attachment: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredMessageAttributes = RequiredKey<MessagesAttributes, 'uuid'>;

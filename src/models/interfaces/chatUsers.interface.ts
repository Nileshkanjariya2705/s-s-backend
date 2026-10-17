import { RequiredKey } from './common.interface';
export interface ChatUsersAttributes {
  uuid: string;
  chat_uuid: string;
  user_uuid: string;
  last_seen: number;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredChatUsersAttributes = RequiredKey<ChatUsersAttributes, 'uuid'>;

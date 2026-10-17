import { RequiredKey } from './common.interface';
export interface NotificationAttributes {
  uuid: string;
  related_entity_type: string;
  related_entity_id: string;
  content_en: string;
  content_ar: string;
  content_ur: string;
  link_to_entity: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredNotificationAttributes = RequiredKey<NotificationAttributes, 'uuid'>;

import { RequiredKey } from './common.interface';
export interface NotificationRecieverAttributes {
  uuid: string;
  notification_uuid: string;
  receiver_uuid: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

export type RequiredNotificationRecieverAttributes = RequiredKey<NotificationRecieverAttributes, 'uuid'>;

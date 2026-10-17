import Notification from '@/models/notification.model';

export interface BuildNotificationArgs {
  data:
    | Request['body']
    | {
        related_entity_type: string;
        related_entity_id: string;
        content_en: string;
        content_ar: string;
        content_ur: string;
        link_to_entity: string;
      };
  action: 'create' | 'update';
  notification?: Notification;
}

export interface CreateNotificationType {
  related_entity_id: string;
  related_entity_type: string;
  notification_type: any;
  notification_content: string;
  entity_uuid?: string;
  permission_name?: string;
  permission_owner?: string;
  entity_info_uuid?: string;
  notification_reciever?: string[];
}

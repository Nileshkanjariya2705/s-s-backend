import NotificationReciever from '@/models/notificationReciever.model';

export interface BuildNotificationRecieverArgs {
  data: Request['body'] | { notification_uuid: string; receiver_uuid: string };
  action: 'create' | 'update';
  notificationReciever?: NotificationReciever;
}

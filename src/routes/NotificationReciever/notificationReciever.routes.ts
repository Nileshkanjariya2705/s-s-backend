import { MessageController } from '@/controllers/Message/message.controller';
import { NotificationRecieverController } from '@/controllers/NotificationReciever/notificationReciever.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { Router } from 'express';

class NotificationRecieverRoute implements Routes {
  public path = '/notification-receiver';
  public router = Router();

  public notificationReceiverController = new NotificationRecieverController(
    new NotificationRecieverRepo(),
    new NotificationRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.route(`${this.path}/get-all`).get(verifyToken, this.notificationReceiverController.getAllNotification);
    this.router
      .route(`${this.path}/get-notification-count`)
      .get(verifyToken, this.notificationReceiverController.getUnreadNotificationCount);
    this.router
      .route(`${this.path}/update-notification`)
      .get(verifyToken, this.notificationReceiverController.updateNotificationRead);
    this.router
      .route(`${this.path}/delete-notification`)
      .post(verifyToken, this.notificationReceiverController.deleteNotification);
  }
}

export default NotificationRecieverRoute;

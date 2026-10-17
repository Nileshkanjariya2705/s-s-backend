import { NotificationController } from '@/controllers/Notification/notification.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';

import NotificationRepo from '@/repository/Notification/notification.repository';
import { Router } from 'express';

class NotificationRoute implements Routes {
  public path = '/notification';
  public router = Router();

  public notificationController = new NotificationController(new NotificationRepo());

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.route(`${this.path}/create`).post(verifyToken, this.notificationController.insertNotification);
  }
}

export default NotificationRoute;

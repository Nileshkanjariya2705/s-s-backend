import { SupportTicketMessageController } from '@/controllers/SupportTicketMessages/supportTicketMessages.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import SupportTicketRepo from '@/repository/SupportTicket/supportTicket.repository';
import SupportTicketMessageRepo from '@/repository/SupportTicketMessages/supportTicketMessages.repository';
import { SupportTicketMessageSchema } from '@/validationSchema/supportTicket.validation.schema';
import { Router } from 'express';

class SupportTicketMessageRoute implements Routes {
  public path = '/support-ticket-message';
  public router = Router();

  public supportTicketMessageController = new SupportTicketMessageController(
    new SupportTicketRepo(),
    new SupportTicketMessageRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
    new AccountUsersRepo(),
  );
  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(
        verifyToken,
        uploadMedia.single('attachment'),
        validationMiddleware(SupportTicketMessageSchema, 'body'),
        this.supportTicketMessageController.createSupportTicketMessage,
      );
  }
}

export default SupportTicketMessageRoute;

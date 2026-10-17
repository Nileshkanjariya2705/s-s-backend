import { SupportTicketController } from '@/controllers/SupportTicket/supportTicket.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import validationMiddleware from '@/middlewares/validation.middleware';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import SupportTicketRepo from '@/repository/SupportTicket/supportTicket.repository';
import SupportTicketMessageRepo from '@/repository/SupportTicketMessages/supportTicketMessages.repository';
import { SupportTicketSchema } from '@/validationSchema/supportTicket.validation.schema';
import { Router } from 'express';

class SupportTicketRoute implements Routes {
  public path = '/support-ticket';
  public router = Router();

  public supportTicketController = new SupportTicketController(
    new SupportTicketRepo(),
    new SupportTicketMessageRepo(),
    new NotificationRepo(),
    new NotificationRecieverRepo(),
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
        validationMiddleware(SupportTicketSchema, 'body'),
        this.supportTicketController.createSupportTicket,
      );

    this.router.route(`${this.path}/getAll`).get(verifyToken, this.supportTicketController.getSupportTicket);
    this.router.route(`${this.path}/get`).get(verifyToken, this.supportTicketController.getSingleSupportTicket);
    this.router.route(`${this.path}/closeTicket`).get(verifyToken, this.supportTicketController.closeSupportTicket);
    this.router
      .route(`${this.path}/delete/:support_ticket_uuid`)
      .delete(this.supportTicketController.deleteSupportTicket);
  }
}

export default SupportTicketRoute;

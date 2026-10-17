import { MessageController } from '@/controllers/Message/message.controller';
import { verifyToken } from '@/helper/auth.helper';
import { Routes } from '@/interfaces/routes.interface';
import { uploadMedia } from '@/middlewares/imageUpload.middleware';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import ChatRepo from '@/repository/Chat/chat.repository';
import ChatUserRepo from '@/repository/ChatUser/chatUser.repository';
import MessageRepo from '@/repository/Message/message.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { Router } from 'express';

class MessageRoute implements Routes {
  public path = '/message';
  public router = Router();

  public messageController = new MessageController(
    new MessageRepo(),
    new ChatRepo(),
    new ChatUserRepo(),
    new NotificationRepo(),
    new AccountUsersRepo(),
    new NotificationRecieverRepo(),
  );

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router
      .route(`${this.path}/create`)
      .post(uploadMedia.single('attachment'), verifyToken, this.messageController.insertMessage);
    this.router.route(`${this.path}/getMessage`).get(verifyToken, this.messageController.getMessages);
    this.router.route(`${this.path}/updateLastSeen`).post(verifyToken, this.messageController.updateLastSeen);
  }
}

export default MessageRoute;

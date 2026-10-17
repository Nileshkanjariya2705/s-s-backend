import { generalResponse, responseType } from '@/helper/common.helper';
import { CHAT_NOTIFICATIONS, LINK_TO_ENTITY, SUPPORT_TICKET_NOTIFICATIONS } from '@/messages/notificationMessages';
import { CHAT_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import ChatUsers from '@/models/chatUsers.model';
import User from '@/models/user.model';
import ChatRepo from '@/repository/Chat/chat.repository';
import ChatUserRepo from '@/repository/ChatUser/chatUser.repository';
import MessageRepo from '@/repository/Message/message.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import { AppSocket, roomUnreadCounts, usersUnreadCount } from '@/socket';
import { NextFunction, Request, Response } from 'express';
import Permissions from '@/models/permissions.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationReciever from '@/models/notificationReciever.model';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { CHAT_CONTENT, LINK_TO_ENTITY_CONSTANT, PURCHASE_REQUEST_NOTIFICATION_CONTENT } from '@/constants/notification';
import { fileToBase64Sync } from '@/utils/general';

const fs = require('fs');
export class MessageController {
  constructor(
    private readonly messageRepository: MessageRepo,
    private readonly chatRepository: ChatRepo,
    private readonly chatUserRepository: ChatUserRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly notificationRecieverRepository: NotificationRecieverRepo,
  ) {}
  public readonly insertMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { order_uuid, user_uuid } = req.body;
      const getChatId = await this.chatRepository.get({ where: { order_uuid: order_uuid } });
      if (getChatId) {
        const userInfo = await User.findOne({ where: { uuid: user_uuid as string } });
        const attachment = req.file ? fileToBase64Sync(req.file.path, req.file.mimetype) : null
        const finalObject = {
          ...req.body,
          attachment:attachment,
          user: { image: userInfo.dataValues.image },
        };
        AppSocket().to(req.body.order_uuid).emit('receive_message', finalObject);
        const userKeys = Object.keys(usersUnreadCount);

        userKeys.forEach((userKey) => {
          if (userKey !== user_uuid && usersUnreadCount[userKey] && usersUnreadCount[userKey][order_uuid]) {
            usersUnreadCount[userKey][order_uuid] += 1;
          }
        });
        AppSocket().except(user_uuid).emit('unreadCount', usersUnreadCount);
        
        await db.transaction(async (t) => {
          const newData = await this.messageRepository.createMessage(
            {
              data: {
                chat_uuid: getChatId.dataValues.uuid,
                ...req.body,
                attachment: req.file ? req.file.filename : null,
              },
              action: 'create',
            },
            { transaction: t },
          );

          await ChatUsers.update(
            { last_seen: Date.now() },
            {
              where: {
                user_uuid: user_uuid as string,
                chat_uuid: getChatId.dataValues.uuid,
              },
              transaction: t,
            },
          );
          const getEntityType = await this.accountUserRepository.get({
            where: { user_uuid: userInfo?.dataValues?.uuid },
          });
  
           await this.notificationRepository.NotificationCreateHandler({
            related_entity_id: getChatId.dataValues.uuid,
            related_entity_type: LINK_TO_ENTITY_CONSTANT.CHAT,
            notification_type: CHAT_NOTIFICATIONS,
            notification_content: CHAT_CONTENT.NEW_MESSAGE_RECEIVED,
            entity_uuid: userInfo?.dataValues?.username,
            permission_name: 'chat',
            permission_owner: getEntityType?.dataValues?.entity_type === 'SUPPLIER' ? 'STORE' : 'SUPPLIER',
            entity_info_uuid:
              getEntityType?.dataValues?.entity_type === 'SUPPLIER'
                ? getChatId?.dataValues?.store_info_uuid
                : getChatId?.dataValues?.supplier_info_uuid,
          });
        });
        return generalResponse(res, null, CHAT_MESSAGES.CHAT_CREATED, 'success', false, 200);
        
      } else {
        return generalResponse(res, null, CHAT_MESSAGES.ORDER_NOT_FOUND, 'success', false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly getMessages = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { order_uuid, user_uuid } = req.query;

        const getChatUserData = await this.chatUserRepository.get({ where: { user_uuid: user_uuid as string } });

        const getChatId = await this.chatRepository.get({
          where: { order_uuid: order_uuid as string },
          transaction: t,
        });

        if (!getChatUserData) {
          await this.chatUserRepository.create({
            chat_uuid: getChatId.dataValues.uuid,
            user_uuid: user_uuid as string,
          });
        }

        await ChatUsers.update(
          { last_seen: Date.now() },
          {
            where: {
              user_uuid: user_uuid as string,
              chat_uuid: getChatId.dataValues.uuid,
            },
            transaction: t,
          },
        );

        if (getChatId) {
          const getChatStatus = await this.chatRepository.get({
            where: { uuid: getChatId.dataValues.uuid },
            attributes: ['status'],
          });

          const getMessage = await this.messageRepository.getAllData({
            where: { chat_uuid: getChatId.dataValues.uuid },
            include: [{ model: User, attributes: ['image'] }],
            order: [['created_at', 'ASC']],
            transaction: t,
          });

          const finalResponse = {
            status: getChatStatus.dataValues.status,
            getMessage,
          };

          return generalResponse(res, finalResponse, CHAT_MESSAGES.CHAT_FETCHED, 'success', false, 200);
        } else {
          return generalResponse(res, null, '', 'success', true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly updateLastSeen = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { order_uuid, user_uuid } = req.body;
        const getChatId = await this.chatRepository.get({
          where: { order_uuid: order_uuid as string },
          transaction: t,
        });

        await ChatUsers.update(
          { last_seen: Date.now() },
          {
            where: {
              user_uuid: user_uuid as string,
              chat_uuid: getChatId.uuid,
            },
            transaction: t,
          },
        );

        return generalResponse(res, null, '', 'success', true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };
}

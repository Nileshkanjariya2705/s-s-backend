import { generalResponse, responseType } from '@/helper/common.helper';
import { CHAT_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import ChatRepo from '@/repository/Chat/chat.repository';
import ChatUserRepo from '@/repository/ChatUser/chatUser.repository';
import { NextFunction, Request, Response } from 'express';

export class ChatController {
  constructor(private readonly chatRepository: ChatRepo, private readonly chatUserRepository: ChatUserRepo) {}

  public readonly createChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let createChat;
      await db.transaction(async (t) => {
        const getChatinfo = await this.chatRepository.get({ where: { order_uuid: req.body.uuid } });
        if (!getChatinfo) {
          createChat = await this.chatRepository.createChat(
            {
              data: { ...req.body, order_uuid: req.body.uuid, status: 'OPEN' },
              action: 'create',
            },
            { transaction: t },
          );
        }

        const createChatUser = await this.chatUserRepository.createChatUser(
          {
            data: {
              ...req.body,
              chat_uuid: createChat.dataValues.uuid,
              user_uuid: req.body.user_uuid,
            },
            action: 'create',
          },
          { transaction: t },
        );
      });
      return generalResponse(res, null, CHAT_MESSAGES.CHAT_CREATED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

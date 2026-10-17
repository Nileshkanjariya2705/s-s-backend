import { generalResponse } from '@/helper/common.helper';
import { CHAT_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import NotificationRepo from '@/repository/Notification/notification.repository';
import { AppSocket } from '@/socket';
import { NextFunction, Request, Response } from 'express';

export class NotificationController {
  constructor(private readonly notificationRepository: NotificationRepo) {}

  // public readonly insertNotification = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     await db.transaction(async (t) => {
  //       const data = await this.notificationRepository.createNotification(
  //         { data: { ...req.body }, action: 'create' },
  //         { transaction: t },
  //       );
  //       return generalResponse(res, null, CHAT_MESSAGES.CHAT_CREATED, responseType.SUCCESS, false, 200);
  //     });
  //   } catch (error) {
  //     return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
  //   }
  // };
}

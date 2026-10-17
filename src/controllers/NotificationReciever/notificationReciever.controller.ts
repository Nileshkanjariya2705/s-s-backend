import { generalResponse, responseType } from '@/helper/common.helper';
import { CHAT_MESSAGES, NOTIFICATION_MESSSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import Notification from '@/models/notification.model';
import NotificationReciever from '@/models/notificationReciever.model';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';

export class NotificationRecieverController {
  constructor(
    private readonly notificationRecieverRepository: NotificationRecieverRepo,
    private readonly notificationRepository: NotificationRepo,
  ) {}

  public readonly getAllNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid, params } = req.query;

      const { page, limit, sort, isAsc } = params as {
        page: string;
        limit: string;
        sort: string;
        isAsc: string;
      };

      const result = await db.transaction(async (t) => {
        const getNotifications = await this.notificationRecieverRepository.getAllData({
          where: { receiver_uuid: uuid as string },
          attributes: { exclude: ['updated_at', 'deleted_at'] },
          include: [{ model: Notification, attributes: { exclude: ['updated_at', 'deleted_at'] } }],
          order: [['created_at', 'DESC']],
          transaction: t,
          limit: +limit,
          offset: (+page - 1) * +limit,
        });
        const allNotificationIds = getNotifications.rows.map((item) => item.dataValues.uuid);
        const updateNotification = await NotificationReciever.update(
          {
            is_read: true,
          },
          {
            where: { uuid: allNotificationIds },
            transaction: t,
          },
        );

        return generalResponse(res, getNotifications, CHAT_MESSAGES.CHAT_CREATED, responseType.SUCCESS, false, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getUnreadNotificationCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.query;

      const getNotifications = await this.notificationRecieverRepository.getAllData({
        where: { receiver_uuid: uuid as string, is_read: false },
        attributes: { exclude: ['uuid'] },
        include: [{ model: Notification, attributes: { exclude: ['updated_at', 'deleted_at'] } }],
        order: [['created_at', 'DESC']],
      });

      return generalResponse(
        res,
        getNotifications?.count,
        CHAT_MESSAGES.CHAT_CREATED,
        responseType.SUCCESS,
        false,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateNotificationRead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.query;

      await NotificationReciever.update(
        {
          is_read: true,
        },
        { where: { is_read: false, receiver_uuid: uuid as string } },
      );
      return generalResponse(res, null, CHAT_MESSAGES.CHAT_CREATED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteNotification = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { deleteIds } = req.body;
      await this.notificationRecieverRepository.deleteData({
        where: { uuid: { [Op.in]: deleteIds } },
      });
      return generalResponse(res, null, NOTIFICATION_MESSSAGES.NOTIFICATION_DELETED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

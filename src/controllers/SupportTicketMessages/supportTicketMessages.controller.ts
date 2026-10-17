import { NextFunction, Request, Response } from 'express';
import SupportTicketRepo from '@/repository/SupportTicket/supportTicket.repository';
import SupportTicketMessageRepo from '@/repository/SupportTicketMessages/supportTicketMessages.repository';
import db from '@/models';
import { entityType, generalResponse, responseType } from '@/helper/common.helper';
import { SUPPORT_TICKET, USER_MESSAGES } from '@/messages/users.messages';
import SupportTicket from '@/models/supportTicket.model';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import AccountUsers from '@/models/accountUsers.model';
import { LINK_TO_ENTITY, SUPPORT_TICKET_NOTIFICATIONS } from '@/messages/notificationMessages';
import { Op } from 'sequelize';
import NotificationReciever from '@/models/notificationReciever.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import Permissions from '@/models/permissions.model';
import { AppSocket } from '@/socket';
import { ADMIN_NOTIFICATION_UUID } from '@/config';

export class SupportTicketMessageController {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepo,
    private readonly supportTicketMessageRepository: SupportTicketMessageRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationRecieverRepository: NotificationRecieverRepo,
    private readonly accountUserRepository: AccountUsersRepo,
  ) {}

  public readonly createSupportTicketMessage = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { support_ticket_uuid, entity_type } = req.body;

        await this.supportTicketMessageRepository.createSupportTicketMessage(
          {
            data: {
              ...req.body,
              attachment: req.file ? req.file.filename : null,
            },
            action: 'create',
          },
          { transaction: t },
        );

        if (entity_type === entityType.SUPER_ADMIN) {
          await SupportTicket.update({ status: 'OPEN' }, { where: { uuid: support_ticket_uuid }, transaction: t });
        }

        const Notification = await this.notificationRepository.createNotification(
          {
            data: {
              related_entity_type: 'SUPPORT_TICKET',
              related_entity_id: support_ticket_uuid,
              content_en: SUPPORT_TICKET_NOTIFICATIONS.SUPPORT_TICKET_REPLY_EN(support_ticket_uuid),
              content_ar: SUPPORT_TICKET_NOTIFICATIONS.SUPPORT_TICKET_REPLY_AR(support_ticket_uuid),
              content_ur: SUPPORT_TICKET_NOTIFICATIONS.SUPPORT_TICKET_CREATED_UR(support_ticket_uuid),
              link_to_entity: LINK_TO_ENTITY.SUPPORT_TICKET(support_ticket_uuid),
            },
            action: 'create',
          },
          { transaction: t },
        );

        const SupportTicketData = await this.supportTicketRepository.get({
          where: { uuid: support_ticket_uuid },
          raw: true,
        });

        const getPermission = await Permissions.findOne({
          attributes: ['uuid'],
          where: {
            name: 'Add Ticket',
            permission_owner: SupportTicketData.entity_type === entityType.SUPPLIER_OWNER ? 'SUPPLIER' : 'STORE',
          },
        });

        const getAccountUsers = await this.accountUserRepository.getAllUserOfEntity(
          SupportTicketData.entity_uuid,
          getPermission.uuid,
        );

        const dataToCreate = [];

        getAccountUsers &&
          Array.isArray(getAccountUsers) &&
          getAccountUsers.length > 0 &&
          getAccountUsers.map((data) => {
            dataToCreate.push({
              notification_uuid: Notification.dataValues.uuid,
              receiver_uuid: data,
            });
          });

        if (entity_type === entityType.SUPER_ADMIN) {
          await NotificationReciever.bulkCreate(dataToCreate, { transaction: t });
          await this.notificationRecieverRepository.Notificationbroadcaster(dataToCreate, getAccountUsers, t);
        } else {
          await this.notificationRecieverRepository.createNotificationReciever(
            {
              data: {
                notification_uuid: Notification.dataValues.uuid,
                receiver_uuid: ADMIN_NOTIFICATION_UUID, //admin uuid
              },
              action: 'create',
            },
            { transaction: t },
          );

          await this.notificationRecieverRepository.Notificationbroadcaster(
            [
              {
                notification_uuid: Notification.dataValues.uuid,
                receiver_uuid: ADMIN_NOTIFICATION_UUID,
              },
            ],
            [ADMIN_NOTIFICATION_UUID],
            t,
          );
        }
      });

      return generalResponse(res, null, SUPPORT_TICKET.SUPPORT_TICKET_SEND_REPLY, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

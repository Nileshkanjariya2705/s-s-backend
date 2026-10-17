import { NextFunction, Request, Response } from 'express';
import SupportTicketRepo from '@/repository/SupportTicket/supportTicket.repository';
import SupportTicketMessageRepo from '@/repository/SupportTicketMessages/supportTicketMessages.repository';
import db from '@/models';
import { formatDateString, entityType, generalResponse, responseType } from '@/helper/common.helper';
import { SUPPORT_TICKET, USER_MESSAGES } from '@/messages/users.messages';
import SupportTicketMessages from '@/models/supportTicketMessages.model';
import { Op } from 'sequelize';
import User from '@/models/user.model';
import SupportTicket from '@/models/supportTicket.model';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { LINK_TO_ENTITY, SUPPORT_TICKET_NOTIFICATIONS } from '@/messages/notificationMessages';
import AccountUsers from '@/models/accountUsers.model';
import StoreInfo from '@/models/storesInfo.model';
import SupplierInfo from '@/models/supplierinfo.model';
import moment from 'moment';
import { ADMIN_NOTIFICATION_UUID } from '@/config';

export class SupportTicketController {
  constructor(
    private readonly supportTicketRepository: SupportTicketRepo,
    private readonly supportTicketMessageRepository: SupportTicketMessageRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationRecieverRepository: NotificationRecieverRepo,
  ) {}

  public readonly createSupportTicket = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { entity_uuid, user_uuid, entity_type } = req.body;
        const getLastRecord = await this.supportTicketRepository.get({
          order: [['created_at', 'DESC']],
          raw: true,
        });

        const supportTicket = await this.supportTicketRepository.createSupportTicket(
          {
            data: {
              ...req.body,
              entity_type: entity_type,
              entity_uuid: entity_uuid,
              ticket_number: getLastRecord ? getLastRecord.ticket_number + 1 : 1000,
              client_last_read: Date.now(),
            },
            action: 'create',
          },
          { transaction: t },
        );

        await this.supportTicketMessageRepository.createSupportTicketMessage(
          {
            data: {
              ...req.body,
              support_ticket_uuid: supportTicket.dataValues.uuid,
              user_uuid: user_uuid,
              attachment: req?.file ? req?.file?.filename : null,
            },
            action: 'create',
          },
          { transaction: t },
        );

        const NotificationData = await this.notificationRepository.createNotification(
          {
            data: {
              related_entity_type: 'SUPPORT_TICKET',
              related_entity_id: supportTicket.dataValues.uuid,
              content_en: SUPPORT_TICKET_NOTIFICATIONS.SUPPORT_TICKET_CREATED_EN(supportTicket.dataValues.uuid),
              content_ar: SUPPORT_TICKET_NOTIFICATIONS.SUPPORT_TICKET_CREATED_AR(supportTicket.dataValues.uuid),
              content_ur: SUPPORT_TICKET_NOTIFICATIONS.SUPPORT_TICKET_CREATED_UR(supportTicket.dataValues.uuid),
              link_to_entity: LINK_TO_ENTITY.SUPPORT_TICKET(supportTicket.dataValues.uuid),
            },
            action: 'create',
          },
          { transaction: t },
        );

        await this.notificationRecieverRepository.createNotificationReciever(
          {
            data: {
              notification_uuid: NotificationData.dataValues.uuid,
              receiver_uuid: ADMIN_NOTIFICATION_UUID, //admin uuid
            },
            action: 'create',
          },
          { transaction: t },
        );

        await this.notificationRecieverRepository.Notificationbroadcaster(
          [
            {
              notification_uuid: NotificationData.dataValues.uuid,
              receiver_uuid: ADMIN_NOTIFICATION_UUID,
            },
          ],
          [ADMIN_NOTIFICATION_UUID],
          t,
        );
      });

      return generalResponse(res, null, SUPPORT_TICKET.SUPPORT_TICKET_CREATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { entity_uuid, entity_type, apiParams } = req.query;
      const { page, limit, sort, isAsc, searchText, extraParams } = apiParams as {
        page: string;
        limit: string;
        sort: string;
        isAsc: string;
        searchText: string;
        extraParams: any;
      };
      const [expiryDateFrom, expiryDateTo] = extraParams?.created_at || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
      let whereCondition: any = {};
      const isOrderAsc = isAsc === 'true';
      let order;

      if (sort) {
        if (sort === 'ticket_number' || sort === 'status') {
          order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
        } else if (sort === 'company_name') {
          order = [['store_uuid', sort, isOrderAsc ? 'ASC' : 'DESC']];
        } else if (sort === 'sending_date') {
          order = [['created_at', isOrderAsc ? 'ASC' : 'DESC']];
        }
      }

      let srch = {};
      if (searchText || extraParams?.ticket_uuid || extraParams?.status || extraParams?.company_name) {
        srch = {
          [Op.or]: [
            {
              '$store_uuid.company_name$': {
                [Op.like]: `%${searchText || extraParams?.company_name}%`,
              },
            },
            {
              '$supplier_uuid.company_name$': {
                [Op.like]: `%${searchText || extraParams?.company_name}%`,
              },
            },

            {
              ticket_number: {
                [Op.like]: `%${searchText || extraParams?.ticket_uuid}%`,
              },
            },
            {
              subject: {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              status: {
                [Op.like]: `%${searchText || extraParams?.status}%`,
              },
            },
          ],
        };
      }

      if (entity_type !== entityType.SUPER_ADMIN) {
        whereCondition.entity_uuid = entity_uuid as string;
      }
      if (extraParams?.created_at) {
        whereCondition = {
          ...whereCondition,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }

      const getUserIds = await AccountUsers.findAll({ where: { entity_uuid: entity_uuid as string } });
      const userIds = [];

      getUserIds.map((data) => {
        userIds.push(data.dataValues.user_uuid);
      });

      const getSupportTicketData = await this.supportTicketRepository.getAllData({
        where: { ...srch, ...whereCondition },
        include: [
          {
            model: SupportTicketMessages,
            attributes: ['created_at', 'text'],
            where: {
              user_uuid: {
                [Op.notIn]: entity_type !== entityType.SUPER_ADMIN ? userIds : [ADMIN_NOTIFICATION_UUID],
              },
            },
            required: false,
          },
          {
            model: StoreInfo,
            as: 'store_uuid',
            attributes: ['company_name'],
          },
          {
            model: SupplierInfo,
            as: 'supplier_uuid',
            attributes: ['company_name'],
          },
        ],
        subQuery: false,
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
      const allSupportTickets = [];

      if (getSupportTicketData) {
        getSupportTicketData.rows.map((ticket_data) => {
          allSupportTickets.push({
            uuid: ticket_data.dataValues.uuid,
            ticket_number: ticket_data.dataValues.ticket_number,
            sending_date: ticket_data.dataValues.created_at,
            subject: ticket_data.dataValues.subject,
            status: ticket_data.dataValues.status,
            company_name: ticket_data.dataValues.supplier_uuid
              ? ticket_data.dataValues.supplier_uuid?.dataValues?.company_name
              : ticket_data.dataValues.store_uuid?.dataValues?.company_name,
            supportTicketMessages: ticket_data.dataValues.supportTicketMessages.filter((data) => {
              if (entity_type !== entityType.SUPER_ADMIN) {
                if (new Date(data.dataValues.created_at) > new Date(ticket_data.dataValues.client_last_read)) {
                  return true;
                }
              } else {
                if (new Date(data.dataValues.created_at) > new Date(ticket_data.dataValues.admin_last_read)) {
                  return true;
                }
              }
            }),
          });
        });
      }

      const finalResponse = {
        count: getSupportTicketData.count,
        allSupportTickets,
      };
      return generalResponse(
        res,
        finalResponse,
        SUPPORT_TICKET.SUPPORT_TICKET_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const singleTicket = await this.supportTicketRepository.get({
          where: { uuid: req.query.support_ticket_uuid as string },
          attributes: ['ticket_number', 'subject', 'status', 'created_at', 'uuid'],
          include: [
            {
              model: SupportTicketMessages,
              attributes: ['user_uuid', 'text', 'attachment', 'created_at'],
              include: [{ model: User, attributes: ['username', 'image'] }],
            },
          ],
          order: [['supportTicketMessages', 'created_at', 'DESC']],
          transaction: t,
        });

        if (singleTicket) {
          if (req.query.entity_type === entityType.SUPER_ADMIN) {
            await SupportTicket.update(
              {
                admin_last_read: Date.now() as number,
              },
              { where: { uuid: singleTicket.dataValues.uuid }, transaction: t },
            );
          } else {
            await SupportTicket.update(
              {
                client_last_read: Date.now() as number,
              },
              { where: { uuid: singleTicket.dataValues.uuid }, transaction: t },
            );
          }
        }
        return generalResponse(
          res,
          singleTicket,
          SUPPORT_TICKET.SUPPORT_TICKET_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly closeSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { support_ticket_uuid } = req.query;
      const SingleTicket = await this.supportTicketRepository.get({ where: { uuid: support_ticket_uuid as string } });
      if (SingleTicket) {
        await SupportTicket.update({ status: 'CLOSED' }, { where: { uuid: support_ticket_uuid as string } });
        return generalResponse(res, null, SUPPORT_TICKET.SUPPORT_TICKET_CLOSED, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, true, 400);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteSupportTicket = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { support_ticket_uuid } = req.params;
        const SingleTicket = await this.supportTicketRepository.get({ where: { uuid: support_ticket_uuid } });
        if (SingleTicket) {
          await this.supportTicketRepository.deleteData({ where: { uuid: support_ticket_uuid }, transaction: t });
          await this.supportTicketMessageRepository.deleteData({ where: { support_ticket_uuid: support_ticket_uuid } });

          const getNotificationIds = await this.notificationRepository.getAll({
            where: { related_entity_id: support_ticket_uuid },
            attributes: ['uuid'],
          });

          await this.notificationRepository.deleteData({
            where: {
              related_entity_id: support_ticket_uuid,
            },
          });

          if (getNotificationIds) {
            await this.notificationRecieverRepository.deleteData({
              where: {
                notification_uuid: { [Op.in]: getNotificationIds.map((data) => data.dataValues.uuid) },
              },
            });
          }

          return generalResponse(res, null, SUPPORT_TICKET.SUPPORT_TICKET_DELETED, responseType.SUCCESS, true, 200);
        } else {
          return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, true, 400);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

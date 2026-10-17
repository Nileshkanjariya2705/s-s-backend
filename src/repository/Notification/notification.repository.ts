import BaseRepository from '../base.repository';
import Notification from '@/models/notification.model';
import { BuildNotificationArgs, CreateNotificationType } from '@/interfaces/Notification/notification.interface';
import db from '@/models';
import { Op } from 'sequelize';
import Permissions from '@/models/permissions.model';
import AccountUsersRepo from '../Authentication/accountUsers.repository';
import NotificationReciever from '@/models/notificationReciever.model';
import NotificationRecieverRepo from '../NotificationReciever/notificationReciever.repository';
import { Create_Notification } from '@/helper/common.helper';

export default class NotificationRepo extends BaseRepository<Notification> {
  private readonly accountUserRepository = new AccountUsersRepo();
  private readonly notificationReceiverRepository = new NotificationRecieverRepo();

  constructor() {
    super(Notification.name);
  }

  readonly createNotification = async (notificationCreateArgs: BuildNotificationArgs, extraParam: { transaction }) => {
    try {
      const { data } = notificationCreateArgs;

      const { transaction } = extraParam;

      const message = await this.create(
        {
          ...data,
        },
        { transaction },
      );
      return message;
    } catch (error) {
      return error;
    }
  };

  readonly NotificationCreateHandler = async ({
    related_entity_id,
    related_entity_type,
    notification_type,
    notification_content,
    entity_uuid,
    permission_name,
    permission_owner,
    entity_info_uuid,
    notification_reciever,
  }: CreateNotificationType) => {
    await db.transaction(async (t) => {
      try {
        let getSpecificUsers;

        const data = Create_Notification(
          notification_type,
          notification_content,
          related_entity_id,
          related_entity_type,
          entity_uuid,
        );

        // if (data && data?.link_to_entity) {
        //   const findnotification = await this.get({
        //     where: { link_to_entity: data?.link_to_entity, related_entity_type: 'ORDERS' },
        //   });  
        //   if (findnotification) {
        //     return;
        //   }
        // }

        const Notification = await this.createNotification(
          {
            data: data,
            action: 'create',
          },
          { transaction: t },
        );

        if (!notification_reciever) {
          const getSpecificPermission = await Permissions.findOne({
            attributes: ['uuid'],
            where: {
              name: permission_name,
              permission_owner: permission_owner,
            },
          });

          getSpecificUsers = await this.accountUserRepository.getAllUserOfEntity(
            entity_info_uuid,
            getSpecificPermission?.dataValues.uuid,
          );
        } else {
          getSpecificUsers = notification_reciever;
        }

        const dataToCreate = [];

        getSpecificUsers &&
          Array.isArray(getSpecificUsers) &&
          getSpecificUsers.length > 0 &&
          getSpecificUsers.map((data) => {
            dataToCreate.push({
              notification_uuid: Notification.dataValues.uuid,
              receiver_uuid: data,
            });
          });

        await NotificationReciever.bulkCreate(dataToCreate, { transaction: t });
        await this.notificationReceiverRepository.Notificationbroadcaster(dataToCreate, getSpecificUsers, t);
      } catch (error) {
        return error;
      }
    });
  };
}

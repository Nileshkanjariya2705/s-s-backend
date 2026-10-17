import BaseRepository from '../base.repository';
import NotificationReciever from '@/models/notificationReciever.model';
import { BuildNotificationRecieverArgs } from '@/interfaces/NotificationReciever/notificationReciever.interface';
import { AppSocket } from '@/socket';
import Notification from '@/models/notification.model';

export default class NotificationRecieverRepo extends BaseRepository<NotificationReciever> {
  constructor() {
    super(NotificationReciever.name);
  }
  readonly createNotificationReciever = async (
    notificationRecieverCreateArgs: BuildNotificationRecieverArgs,
    extraParam: { transaction },
  ) => {
    try {
      const { data } = notificationRecieverCreateArgs;

      const { transaction } = extraParam;

      const notification = await this.create(
        {
          ...data,
        },
        { transaction },
      );
      return notification;
    } catch (error) {
      return error;
    }
  };

  readonly Notificationbroadcaster = async (dataToCreate, getSpecificUsers, t) => {
    try {
      const promiseArray = [];
      let index = 0;
      for (const user of dataToCreate) {
        const AlertReceiver = await NotificationReciever.findOne({
          where: {
            receiver_uuid: user.receiver_uuid,
            notification_uuid: user.notification_uuid,
          },
          transaction: t,
          include: [
            {
              model: Notification,
            },
          ],
        });

        if (AlertReceiver) {
          AppSocket().to(getSpecificUsers[index]).emit('receive_notification', AlertReceiver);
          index++;
        }
        promiseArray.push(AlertReceiver);
      }

      await Promise.all(promiseArray);
    } catch (error) {
      return error;
    }
  };
}

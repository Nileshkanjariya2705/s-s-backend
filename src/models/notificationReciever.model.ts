import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
  NotificationRecieverAttributes,
  RequiredNotificationRecieverAttributes,
} from './interfaces/notificationReciever.interface';
import Notification from './notification.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'notification_reciever',
})
export default class NotificationReciever extends Model<
  NotificationRecieverAttributes,
  RequiredNotificationRecieverAttributes
> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  notification_uuid: string;
  @BelongsTo(() => Notification, 'notification_uuid')
  notification: Notification;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  receiver_uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  is_read: boolean;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

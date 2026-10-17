import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

import { NotificationAttributes, RequiredNotificationAttributes } from './interfaces/notification.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'notification',
})
export default class Notification extends Model<NotificationAttributes, RequiredNotificationAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('PURCHASE_REQUEST', 'CHAT', 'SUPPORT_TICKET', 'ORDERS', 'STORE_SIGNUP', 'SUPPLIER_SIGNUP'),
  })
  related_entity_type: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  related_entity_id: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  content_en: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  content_ar: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  content_ur: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  link_to_entity: string;

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

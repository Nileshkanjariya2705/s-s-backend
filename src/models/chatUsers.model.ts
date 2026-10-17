import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import StoreInfo from './storesInfo.model';
import SupplierInfo from './supplierinfo.model';
import Orders from './orders.model';
import { ChatUsersAttributes, RequiredChatUsersAttributes } from './interfaces/chatUsers.interface';
import Chat from './chat.model';
import User from './user.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'chat_users',
})
export default class ChatUsers extends Model<ChatUsersAttributes, RequiredChatUsersAttributes> {
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
  chat_uuid: string;
  @BelongsTo(() => Chat, 'chat_uuid')
  chat: Chat;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  user_uuid: string;
  @BelongsTo(() => User, 'user_uuid')
  user: User;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  last_seen: Date;

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

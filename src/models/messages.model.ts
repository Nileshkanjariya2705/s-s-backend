import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import Chat from './chat.model';
import User from './user.model';
import { MessagesAttributes, RequiredMessageAttributes } from './interfaces/messages.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'messages',
})
export default class Messages extends Model<MessagesAttributes, RequiredMessageAttributes> {
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
    type: DataTypes.TEXT,
  })
  message: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  attachment: string;

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

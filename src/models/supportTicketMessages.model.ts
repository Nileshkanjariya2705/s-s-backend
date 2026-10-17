import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import {
  RequiredSupportTicketMessagesAttributes,
  SupportTicketMessagesAttributes,
} from './interfaces/supportTicketMessage.interface';
import SupportTicket from './supportTicket.model';
import User from './user.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'support_ticket_messages',
})
export default class SupportTicketMessages extends Model<
  SupportTicketMessagesAttributes,
  RequiredSupportTicketMessagesAttributes
> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @ForeignKey(() => SupportTicket)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  support_ticket_uuid: string;
  @BelongsTo(() => SupportTicket)
  support_ticket: SupportTicket;

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
  text: string;

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

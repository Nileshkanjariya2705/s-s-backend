import { BelongsTo, Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredSupportTicketAttributes, SupportTicketAttributes } from './interfaces/supportTicket.interface';
import SupportTicketMessages from './supportTicketMessages.model';
import StoreInfo from './storesInfo.model';
import SupplierInfo from './supplierinfo.model';
import User from './user.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'support_ticket',
})
export default class SupportTicket extends Model<SupportTicketAttributes, RequiredSupportTicketAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('STORE_OWNER', 'SUPPLIER_OWNER'),
  })
  entity_type: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  entity_uuid: string;

  @BelongsTo(() => StoreInfo, 'entity_uuid')
  store_uuid: StoreInfo;

  @BelongsTo(() => SupplierInfo, 'entity_uuid')
  supplier_uuid: SupplierInfo;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: 'f29395e1-b97d-4278-8a79-8182299cb3a7',
  })
  admin_uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  subject: string;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  ticket_number: number;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  admin_last_read: Date;

  @Column({
    allowNull: true,
    type: DataTypes.DATE,
  })
  client_last_read: Date;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('NEW', 'OPEN', 'CLOSE'),
    defaultValue: 'NEW',
  })
  status: String;

  @HasMany(() => SupportTicketMessages, 'support_ticket_uuid')
  supportTicketMessages: SupportTicketMessages[];

  @BelongsTo(() => User, 'entity_uuid')
  user: User;

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

import { BelongsTo, Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import PurchaseRequests from './purchaseRequest.model';
import Address from './address.model';
import User from './user.model';
import StoreInfo from './storesInfo.model';
import SupplierInfo from './supplierinfo.model';
import { ChatAttributes, RequiredChatAttributes } from './interfaces/chat.interface';
import Orders from './orders.model';
import Messages from './messages.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'chat',
})
export default class Chat extends Model<ChatAttributes, RequiredChatAttributes> {
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
  order_uuid: string;
  @BelongsTo(() => Orders, 'order_uuid')
  orders: Orders;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  store_info_uuid: string;
  @BelongsTo(() => StoreInfo, 'store_info_uuid')
  storeInfo: StoreInfo;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  supplier_info_uuid: string;
  @BelongsTo(() => SupplierInfo, 'supplier_info_uuid')
  supplierInfo: SupplierInfo;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('OPEN', 'CLOSED'),
  })
  status: string;

  @HasMany(() => Messages, 'chat_uuid')
  message: Messages;

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

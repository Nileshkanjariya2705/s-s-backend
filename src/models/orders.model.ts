import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';

import { DataTypes } from 'sequelize';
import { OrderAttributes, RequiredOrderAttributes } from './interfaces/orders.interface';
import PurchaseRequests from './purchaseRequest.model';
import Address from './address.model';
import User from './user.model';
import StoreInfo from './storesInfo.model';
import SupplierInfo from './supplierinfo.model';
import Chat from './chat.model';
import OrderProducts from './orderProduct.model';
import PaymentDetail from './paymentDetails.model';
import OrderReplacementRequests from './orderReplacement';
import RefundOrders from './refundOrders.model';
import RefundOrderProducts from './refundOrderProducts.model';
import OrderProductsReplaceRequest from './orderProductsReplaceRequest.model';
import Branch from './branches.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'orders',
})
export default class Orders extends Model<OrderAttributes, RequiredOrderAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  created_by: string;
  @BelongsTo(() => User, 'created_by')
  user: User;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  purchase_request_id: string;
  @BelongsTo(() => PurchaseRequests, 'purchase_request_id')
  purchaseRequest: PurchaseRequests;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  address_id: string;
  @BelongsTo(() => Address, 'address_id')
  address: Address;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  store_info_uuid: string;
  @BelongsTo(() => StoreInfo, 'store_info_uuid')
  storeInfo: StoreInfo;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  supplier_info_uuid: string;
  @BelongsTo(() => SupplierInfo, 'supplier_info_uuid')
  supplierInfo: SupplierInfo;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  additional_info: string;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'),
  })
  status: string;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('CARD', 'BANK_TRANSFER'),
  })
  payment_mode: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  payment_receipt: string;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  vat_percentage: Number;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
  })
  is_mail_sent: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  reason_for_cancel: string;

  @Column({
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  replacement_request: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('ACCEPTED', 'PACKAGED', 'IN_TRANSIT', 'DELIVERED', 'REJECTED', 'PENDING'),
  })
  replacement_status: string;

  @Column({
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  refund_request: boolean;

  @Column({
    allowNull: false,
    defaultValue: false,
    type: DataTypes.BOOLEAN,
  })
  refund_accepted_admin: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('PENDING', 'ACCEPTED', 'REJECTED'),
  })
  refund_accepted_supplier: string;

  @Column({
    allowNull: false,
    type: DataTypes.FLOAT,
  })
  amount_without_vat: number;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  branch_uuid: string;
  @BelongsTo(() => Branch, 'branch_uuid')
  Branch: Branch;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @HasOne(() => Chat, 'order_uuid')
  chat: Chat;

  @HasMany(() => OrderProducts, 'order_id')
  OrderProducts: OrderProducts[];

  @HasMany(() => PaymentDetail, 'order_id')
  PaymentDetail: PaymentDetail;

  @HasMany(() => OrderReplacementRequests, 'order_id')
  OrderReplacement: OrderReplacementRequests;

  @HasMany(() => RefundOrders, 'order_uuid')
  RefundOrders: RefundOrders;

  @HasMany(() => OrderProductsReplaceRequest, 'order_uuid')
  OrderProductsReplaceRequest: OrderProductsReplaceRequest;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

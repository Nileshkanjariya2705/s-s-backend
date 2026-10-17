import { BelongsTo, Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { DataTypes } from 'sequelize';
import Orders from './orders.model';
import { RefundOrdersAttributes, RequiredRefundOrdersAttributes } from './interfaces/refundOrder.interface';
import RefundOrderProducts from './refundOrderProducts.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'refund_orders',
})
export default class RefundOrders extends Model<RefundOrdersAttributes, RequiredRefundOrdersAttributes> {
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
    type: DataTypes.FLOAT,
  })
  refundable_amount: number;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  order_amount_left: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @HasMany(() => RefundOrderProducts, 'refund_order_uuid')
  RefundOrderProducts: RefundOrderProducts;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

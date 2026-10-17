import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import Orders from './orders.model';
import { OrderReplacementRequestsAttributes, RequiredOrderReplacementRequestsAttributes } from './interfaces/orderReplacementRequests.interface';
import OrderProductsReplaceRequest from './orderProductsReplaceRequest.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'order_replace_requests',
})
export default class OrderReplacementRequests extends Model<OrderReplacementRequestsAttributes, RequiredOrderReplacementRequestsAttributes> {
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
  order_id: string;
  @BelongsTo(() => Orders, 'order_id')
  orders: Orders;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @HasMany(() => OrderProductsReplaceRequest, 'order_replace_requests_uuid')
  OrderProductsReplaceRequest: OrderProductsReplaceRequest;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

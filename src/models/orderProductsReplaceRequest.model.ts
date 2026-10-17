import {
  AllowNull,
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import Orders from './orders.model';

import {
  OrderProductsReplaceRequestAttributes,
  RequiredOrderProductsReplaceRequestAttributes,
} from './interfaces/orderProductsReplaceRequest.interface';
import OrderProducts from './orderProduct.model';
import Products from './products.model';
import OrderReplacementRequests from './orderReplacement';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'order_products_replace_request',
})
export default class OrderProductsReplaceRequest extends Model<
  OrderProductsReplaceRequestAttributes,
  RequiredOrderProductsReplaceRequestAttributes
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
  order_uuid: string;
  @BelongsTo(() => Orders, 'order_uuid')
  orders: Orders;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  order_replace_requests_uuid: string;
  @BelongsTo(() => OrderReplacementRequests, 'order_replace_requests_uuid')
  OrderReplacementRequests: OrderReplacementRequests;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  order_product_uuid: string;
  @BelongsTo(() => OrderProducts, 'order_product_uuid')
  OrderProducts: OrderProducts;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  rejection_reason: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('ACCEPTED', 'REJECTED'),
  })
  replacement_product_status: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  product_uuid: string;
  @BelongsTo(() => Products, 'product_uuid')
  Products: Products;

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

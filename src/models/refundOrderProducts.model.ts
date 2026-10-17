import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';

import { DataTypes } from 'sequelize';
import RefundOrders from './refundOrders.model';
import OrderProducts from './orderProduct.model';
import Products from './products.model';
import {
  RefundOrderProductsAttributes,
  RequiredRefundOrderProductsAttributes,
} from './interfaces/refundOrderProducts.interface';
import Orders from './orders.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'refund_order_products',
})
export default class RefundOrderProducts extends Model<
  RefundOrderProductsAttributes,
  RequiredRefundOrderProductsAttributes
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
  refund_order_uuid: string;
  @BelongsTo(() => RefundOrders, 'refund_order_uuid')
  RefundOrders: RefundOrders;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  order_uuid: string;
  @BelongsTo(() => Orders, 'order_uuid')
  Orders: Orders;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  order_product_uuid: string;
  @BelongsTo(() => OrderProducts, 'order_product_uuid')
  OrderProducts: OrderProducts;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  product_uuid: string;
  @BelongsTo(() => Products, 'product_uuid')
  Products: Products;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  reason: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('ACCPETED', 'REJECTED'),
  })
  refund_product_status: string;

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

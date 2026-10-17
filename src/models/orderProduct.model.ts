import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { OrderProductsAttributes, RequiredOrderProductsAttributes } from './interfaces/orderProduct.interface';
import Orders from './orders.model';
import SupplierProductQuotes from './supplierProductQuotes.model';
import Products from './products.model';
import OrderProductsReplaceRequest from './orderProductsReplaceRequest.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'order_products',
})
export default class OrderProducts extends Model<OrderProductsAttributes, RequiredOrderProductsAttributes> {
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

  @ForeignKey(() => Products)
  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  product_uuid: string;
  @BelongsTo(() => Products, 'product_uuid')
  product: Products;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  quote_id: string;
  @BelongsTo(() => SupplierProductQuotes, 'quote_id')
  supplierProductQuotes: SupplierProductQuotes;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  price: string;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataTypes.TEXT('long'),
    allowNull: true,
  })
  replacement_reason: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  replacement_request: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  refund_request: boolean;

  @Column({
    type: DataTypes.TEXT('long'),
    allowNull: true,
  })
  refund_reason: string;
  
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

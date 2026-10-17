import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

import PurchaseRequests from './purchaseRequest.model';

import Orders from './orders.model';
import SupplierInfo from './supplierinfo.model';
import { RequiredReviewsAttributes, ReviewsAttributes } from './interfaces/reviews.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'reviews',
})
export default class Reviews extends Model<ReviewsAttributes, RequiredReviewsAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  purchase_request_uuid: string;
  @BelongsTo(() => PurchaseRequests, 'purchase_request_uuid')
  PurchaseRequests: PurchaseRequests;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  order_uuid: string;
  @BelongsTo(() => Orders, 'order_uuid')
  orders: Orders;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  supplier_info_uuid: string;
  @BelongsTo(() => SupplierInfo, 'supplier_info_uuid')
  supplier_info: SupplierInfo;

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  reviews: string;

  @Column({
    type: DataTypes.BIGINT,
    allowNull: true,
  })
  rating: number;

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

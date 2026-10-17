import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

import PurchaseRequests from './purchaseRequest.model';

import {
  PurchaseRequestProductAttributes,
  RequiredPurchaseRequestProductAttributes,
} from './interfaces/productPurchaseRequests.interface';
import Products from './products.model';
import Category from './category.model';
import SupplierProductQuotes from './supplierProductQuotes.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'purchase_request_products',
})
export default class PurchaseRequestProducts extends Model<
  PurchaseRequestProductAttributes,
  RequiredPurchaseRequestProductAttributes
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
  purchase_request_uuid: string;
  @BelongsTo(() => PurchaseRequests, 'purchase_request_uuid')
  PurchaseRequests: PurchaseRequests;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  product_uuid: string;
  @BelongsTo(() => Products, 'product_uuid')
  products: Products;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  category_uuid: string;
  @BelongsTo(() => Category, 'category_uuid')
  Category: Category;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
  })
  requested_price: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  requested_quantity: number;

  @Column({
    type: DataTypes.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  allow_other_brands: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  is_purchased: boolean;

  @HasMany(() => SupplierProductQuotes, 'purchase_request_products_uuid')
  product_detail: SupplierProductQuotes[];

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

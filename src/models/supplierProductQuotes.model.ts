import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

import PurchaseRequests from './purchaseRequest.model';

import {
  RequiredSupplierProductQuotesAttributes,
  SupplierProductQuotesAttributes,
} from './interfaces/supplierProductQuotes.interface';
import ProductPurchaseRequests from './purchaseRequestsProduct.model';
import SupplierQuotes from './supplierQuotes.model';
import Products from './products.model';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'supplier_product_quotes',
})
export default class SupplierProductQuotes extends Model<
  SupplierProductQuotesAttributes,
  RequiredSupplierProductQuotesAttributes
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
  purchase_request_products_uuid: string;
  @BelongsTo(() => ProductPurchaseRequests, 'purchase_request_products_uuid')
  ProductPurchaseRequests: PurchaseRequests;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  supplier_quotes_uuid: string;
  @BelongsTo(() => SupplierQuotes, 'supplier_quotes_uuid')
  SupplierQuotes: SupplierQuotes;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  other_brand_product_uuid: string;
  @BelongsTo(() => Products, 'other_brand_product_uuid')
  otherBrandProduct: Products;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  offered_price: number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
  })
  offered_quantity: number;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: true,
  })
  is_approved: boolean;

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

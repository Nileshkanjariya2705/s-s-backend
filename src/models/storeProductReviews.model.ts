import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import SupplierInfo from './supplierinfo.model';
import StoreInfo from './storesInfo.model';
import User from './user.model';
import { RequiredStoreProductReviews, StoreProductReviewsAttributes } from './interfaces/storeProductReviews.interface';
import Products from './products.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'store_product_reviews',
})
export default class StoreProductReviews extends Model<StoreProductReviewsAttributes, RequiredStoreProductReviews> {
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
  product_uuid: string;
  @BelongsTo(() => Products, 'product_uuid')
  product_info: Products;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  review_by: string;
  @BelongsTo(() => User, 'review_by')
  user_info: User;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  supplier_info_uuid: string;
  @BelongsTo(() => SupplierInfo, 'supplier_info_uuid')
  supplier_info: SupplierInfo;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  store_info_uuid: string;
  @BelongsTo(() => StoreInfo, 'store_info_uuid')
  store_info: StoreInfo;

  @Column({
    type: DataTypes.STRING,
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

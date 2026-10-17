import {
  BelongsTo,
  BelongsToMany,
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
import Category from './category.model';
import { ProductsAttributes, RequiredProductsAttributes } from './interfaces/products.interface';
import Measurement from './measurement.model';
import SupplierProducts from './supplierProducts.model';
import PurchaseRequestProducts from './purchaseRequestsProduct.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'products',
})
export default class Products extends Model<ProductsAttributes, RequiredProductsAttributes> {
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
  name_en: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  name_ar: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  name_ur: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  overview_en: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  overview_ur: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  overview_ar: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  description_en: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  description_ar: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  description_ur: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  specification_en: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  specification_ar: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  specification_ur: string;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  category_uuid: string;
  @BelongsTo(() => Category, 'category_uuid')
  category: Category;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  measurement_uuid: string;
  @BelongsTo(() => Measurement, 'measurement_uuid')
  measurement: Measurement;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  images: string;
  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  featured_image: string;

  @Column({
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    allowNull: false,
  })
  status: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @HasMany(() => SupplierProducts, 'product_uuid')
  supplier_products: SupplierProducts[];

  @HasMany(() => PurchaseRequestProducts, 'product_uuid')
  product_purchase_req: PurchaseRequestProducts;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

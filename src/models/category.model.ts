import { Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredUserAttributes, UserAttributes } from './interfaces/user.model.interface';
import { CategoryAttributes, RequiredCategoryAttributes } from './interfaces/category.interface';
import Products from './products.model';
import Measurement from './measurement.model';
import SupplierProducts from './supplierProducts.model';

@Table({
  timestamps: true,
  tableName: 'category',
  paranoid: true,
})
export default class Category extends Model<CategoryAttributes, RequiredCategoryAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  })
  name: string;

  @Column({
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  })
  status: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  image: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @Column({
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  })
  name_ar: string;

  @Column({
    allowNull: false,
    unique: true,
    type: DataTypes.STRING,
  })
  name_ur: string;

  @HasMany(() => Products, 'category_uuid')
  products: Products[];

  @HasMany(() => SupplierProducts, 'product_uuid')
  supplier_products: SupplierProducts[];

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    // delete values.password;
    return values;
  };
}

import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import Products from './products.model';
import { RequiredSupplierProductsAttributes, SupplierProductsAttributes } from './interfaces/supplierProduct.interface';
import SupplierInfo from './supplierinfo.model';
import User from './user.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'supplier_products',
})
export default class SupplierProducts extends Model<SupplierProductsAttributes, RequiredSupplierProductsAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @ForeignKey(() => Products)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  product_uuid: string;
  @BelongsTo(() => Products, 'product_uuid')
  product: Products;

  @ForeignKey(() => SupplierInfo)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  supplier_uuid: string;
  @BelongsTo(() => User, 'supplier_uuid')
  supplier: User;

  @ForeignKey(() => SupplierInfo)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  supplier_info_uuid: string;
  @BelongsTo(() => SupplierInfo, 'supplier_info_uuid')
  supplier_info: SupplierInfo;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  price: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  base_price: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  units: string;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  is_purchaseable: boolean;

  @Column({
    type: DataTypes.DATE,
    allowNull: false,
  })
  end_date: Date;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  charges: number;

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

import { Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredSupplierInfoAttributes, SupplierInfoAttributes } from './interfaces/supplierinfo.interface';
import Orders from './orders.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'supplier_info',
})
export default class SupplierInfo extends Model<SupplierInfoAttributes, RequiredSupplierInfoAttributes> {
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
  company_name: string;

  @Column({
    allowNull: false,
    type: DataTypes.BIGINT,
  })
  cr_number: Number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  tax_number: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  iban_number: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  address: string;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  is_verified: boolean;

  @Column({
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  })
  is_active: boolean;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  Ord_Commission: number;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  Bank_Commission: number;
  @HasMany(() => Orders, 'supplier_info_uuid')
  Orders: Orders[];

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}

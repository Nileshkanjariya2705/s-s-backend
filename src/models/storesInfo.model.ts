import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredStoreInfoAttributes, StoreInfoAttributes } from './interfaces/storeInfo.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'store_info',
})
export default class StoreInfo extends Model<StoreInfoAttributes, RequiredStoreInfoAttributes> {
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
  cr_number: string;

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

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}

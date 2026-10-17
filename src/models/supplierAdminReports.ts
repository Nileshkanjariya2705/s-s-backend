import { BelongsTo, Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import Orders from './orders.model';
import {
  RequiredSupplierAdminReportsAttributes,
  SupplierAdminReportsAttributes,
} from './interfaces/supplierAdminReports.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'supplier_admin_reports',
})
export default class SupplierAdminReports extends Model<
  SupplierAdminReportsAttributes,
  RequiredSupplierAdminReportsAttributes
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
  supplier_info_uuid: string;
  @BelongsTo(() => Orders, 'supplier_info_uuid')
  orders: Orders;

  @Column({
    type: DataTypes.NUMBER,
    defaultValue: false,
  })
  month: number;

  @Column({
    type: DataTypes.NUMBER,
    defaultValue: false,
  })
  year: number;

  @Column({
    type: DataTypes.TEXT('long'),
    defaultValue: false,
  })
  file: string;

  @Column({
    type: DataTypes.TEXT('long'),
    defaultValue: false,
  })
  sheets: string;

  @Column({
    type: DataTypes.TEXT,
    defaultValue: false,
  })
  status: string;
    
  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;
}

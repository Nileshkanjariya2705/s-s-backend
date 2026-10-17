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

import PurchaseRequests from './purchaseRequest.model';

import User from './user.model';
import SupplierInfo from './supplierinfo.model';
import { RequiredSupplierQuotesAttributes, SupplierQuotesAttributes } from './interfaces/supplierQuotes.interface';
import SupplierProductQuotes from './supplierProductQuotes.model';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'supplier_quotes',
})
export default class SupplierQuotes extends Model<SupplierQuotesAttributes, RequiredSupplierQuotesAttributes> {
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
  quoted_by: string;
  @BelongsTo(() => User, 'quoted_by')
  user: User;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  supplier_info_uuid: string;
  @BelongsTo(() => SupplierInfo, 'supplier_info_uuid')
  supplier_info: SupplierInfo;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  purchase_request_uuid: string;
  @BelongsTo(() => PurchaseRequests, 'purchase_request_uuid')
  PurchaseRequests: PurchaseRequests;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
  })
  is_paid: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('CARD', 'BANK_TRANSFER'),
  })
  payment_method: string;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  charges_and_total: number;

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

  @HasMany(() => SupplierProductQuotes, 'supplier_quotes_uuid')
  supplier_product_quotes: SupplierProductQuotes;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

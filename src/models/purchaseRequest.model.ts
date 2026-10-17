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
import StoreInfo from './storesInfo.model';
import User from './user.model';
import { PurchaseRequestAttributes, RequiredPurchaseRequestAttributes } from './interfaces/purchaseRequest.interface';
import SupplierInfo from './supplierinfo.model';
import PurchaseRequestProducts from './purchaseRequestsProduct.model';
import SupplierQuotes from './supplierQuotes.model';
import Branch from './branches.model';
import Address from './address.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'purchase_requests',
})
export default class PurchaseRequests extends Model<PurchaseRequestAttributes, RequiredPurchaseRequestAttributes> {
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
  requester_uuid: string;
  @BelongsTo(() => User, 'requester_uuid')
  user: User;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  store_info_uuid: string;
  @BelongsTo(() => StoreInfo, 'store_info_uuid')
  storeInfo: StoreInfo;

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
  address_uuid: string;
  @BelongsTo(() => Address, 'address_uuid')
  address_info: Address;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  branch_uuid: string;
  @BelongsTo(() => Branch, 'branch_uuid')
  branch_info: Branch;

  @Column({
    allowNull: false,
    type: DataTypes.DATE,
  })
  quotes_accepted_upto: Date;

  @Column({
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  offer_for_entire_request: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('NEW', 'QUOTED', 'COMPLETED', 'EXPIRED', 'BUY_NOW'),
  })
  status: string;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
  })
  total_price: number;

  @Column({
    allowNull: false,
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  })
  is_closed: boolean;

  @HasMany(() => PurchaseRequestProducts, 'purchase_request_uuid')
  PurchaseRequestProducts: PurchaseRequestProducts[];

  @HasMany(() => SupplierQuotes, 'purchase_request_uuid')
  supplier_quote: SupplierQuotes;

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

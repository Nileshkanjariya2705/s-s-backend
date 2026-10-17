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
import User from './user.model';
import Roles from './roles.model';
import { AccountUser, RequiredAccountUser } from './interfaces/acccount.interface';
import StoreInfo from './storesInfo.model';
import SupplierInfo from './supplierinfo.model';
import Address from './address.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'account_users',
})
export default class AccountUsers extends Model<AccountUser, RequiredAccountUser> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('STORE', 'SUPPLIER'),
  })
  entity_type: string;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  entity_uuid: string;
  @BelongsTo(() => StoreInfo, 'entity_uuid')
  store_uuid: StoreInfo;
  @BelongsTo(() => SupplierInfo, 'entity_uuid')
  supplier_uuid: SupplierInfo;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  user_uuid: string;
  @BelongsTo(() => User, 'user_uuid')
  user: User;


  @ForeignKey(() => Roles)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  role_uuid: string;
  @BelongsTo(() => Roles)
  role_id: Roles;

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

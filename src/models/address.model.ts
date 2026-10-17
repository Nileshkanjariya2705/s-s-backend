import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import User from './user.model';
import { AddressAttributes, RequiredAddressAttributes } from './interfaces/address.interface';
import Branch from './branches.model';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'address',
})
export default class Address extends Model<AddressAttributes, RequiredAddressAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  user_uuid: string;
  @BelongsTo(() => User, 'user_uuid')
  user: User;

  @ForeignKey(() => Branch)
  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  branch_uuid: string;
  @BelongsTo(() => Branch, 'branch_uuid')
  branch: Branch;

  @Column({
    type: DataTypes.UUID,
    allowNull: true,
    defaultValue:null
  })
  entity_info_uuid: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  entity_type: string;

  @Column({
    type: DataTypes.TEXT,
    allowNull: false,
  })
  address: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  city: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  country: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  state: string;

  @Column({
    type: DataTypes.BIGINT,
    allowNull: false,
  })
  postal_code: number;

  @Column({
    type: DataTypes.BIGINT,
    allowNull: false,
  })
  phone: number;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
  })
  is_default: number;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    // delete values.password;
    return values;
  };
}

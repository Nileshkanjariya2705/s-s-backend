import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { BranchAttributes, RequiredBranchAttributes } from './interfaces/branches.interface';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'branches',
})
export default class Branch extends Model<BranchAttributes, RequiredBranchAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('STORE', 'SUPPLIER'),
  })
  entity_type: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  entity_uuid: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  name: string;

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

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    // delete values.password;
    return values;
  };
}

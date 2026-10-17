import { Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredRolesAttributes, RolesAttributes } from './interfaces/roles.interface';
import { entityType } from '@/helper/common.helper';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'roles',
})
export default class Roles extends Model<RolesAttributes, RequiredRolesAttributes> {
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
    defaultValue: entityType.STORE_OWNER,
  })
  name: string;
  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: entityType.STORE_OWNER,
  })
  name_ar: string;
  @Column({
    allowNull: false,
    type: DataTypes.STRING,
    defaultValue: entityType.STORE_OWNER,
  })
  name_ur: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
  })
  slug: string;

  @Column({
    type: DataTypes.ENUM('INACTIVE', 'ACTIVE'),
    defaultValue: 'INACTIVE',
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
    return values;
  };
}

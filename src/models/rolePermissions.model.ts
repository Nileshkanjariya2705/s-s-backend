import { Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import Permissions from './permissions.model';
import {
  RequiredRolePermissionsAttributesAttributes,
  RolePermissionsAttributes,
} from './interfaces/rolePermissions.interface';
import Roles from './roles.model';

@Table({
  timestamps: true,
  paranoid: false,
  tableName: 'role_permissions',
})
export default class RolePermissions extends Model<
  RolePermissionsAttributes,
  RequiredRolePermissionsAttributesAttributes
> {
  static bulkUpdate(
    rolePermissions: any[],
    arg1: { where: { role_uuid: any } },
    arg2: { transaction: import('sequelize').Transaction },
  ) {
    throw new Error('Method not implemented.');
  }
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;
  @ForeignKey(() => Roles)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  role_uuid: string;

  @ForeignKey(() => Permissions)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  permission_uuid: string;
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

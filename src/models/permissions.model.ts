import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { PermissionsAttributes, RequiredPermissionsAttributes } from './interfaces/permissions.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'permissions',
})
export default class Permissions extends Model<PermissionsAttributes, RequiredPermissionsAttributes> {
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
  name: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  })
  slug: string;

  @Column({
    allowNull: false,
    type: DataTypes.ENUM('STORE', 'SUPPLIER'),
  })
  permission_owner: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  permission_type: string;

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

import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import User from './user.model';
import Roles from './roles.model';
import { AccountRole, RequiredAccountRolesAttributes } from './interfaces/accountRole.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'account_roles',
})
export default class AccountRoles extends Model<AccountRole, RequiredAccountRolesAttributes> {
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

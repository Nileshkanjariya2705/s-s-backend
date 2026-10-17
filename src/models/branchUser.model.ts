import { BelongsTo, Column, CreatedAt, DeletedAt, ForeignKey, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import User from './user.model';
import Branch from './branches.model';
import { BranchUsersAttributes, RequiredBranchUsersAttributes } from './interfaces/branchUsers.interface';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'branch_users',
})
export default class BranchUsers extends Model<BranchUsersAttributes, RequiredBranchUsersAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  user_uuid: string;
  @BelongsTo(() => User, 'user_uuid')
  user: User;

  @ForeignKey(() => User)
  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  branch_uuid: string;
  @BelongsTo(() => Branch, 'branch_uuid')
  branch: Branch;

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
    return values;
  };
}

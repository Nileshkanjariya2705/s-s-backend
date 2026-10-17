import { Column, CreatedAt, DeletedAt, HasMany, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredUserAttributes, UserAttributes } from './interfaces/user.model.interface';
import Address from './address.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'users',
})
export default class User extends Model<UserAttributes, RequiredUserAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    unique: false,
    type: DataTypes.STRING,
  })
  email: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  username: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  password: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  image: string;

  @Column({
    allowNull: true,
    unique: true,
    type: DataTypes.BIGINT,
  })
  phone: bigint;

  @Column({
    allowNull: false,
    defaultValue: true,
    type: DataTypes.BOOLEAN,
  })
  is_active: boolean;

  @HasMany(() => Address, 'user_uuid')
  address: Address;

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

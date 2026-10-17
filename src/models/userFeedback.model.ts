import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredUserConatactAttributes, UserContactAttributes } from './interfaces/userFeedback.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'user_contact',
})
export default class UserContact extends Model<UserContactAttributes, RequiredUserConatactAttributes> {
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
  firstname: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  lastname: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  email: string;

  @Column({
    allowNull: true,
    type: DataTypes.BIGINT,
  })
  phone: bigint;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  message: string;

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

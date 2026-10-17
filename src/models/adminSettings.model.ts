import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { AdminSettingsAttributes, RequiredAdminSettingsAttributes } from './interfaces/adminSettings.interface';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'admin_settings',
})
export default class AdminSettings extends Model<AdminSettingsAttributes, RequiredAdminSettingsAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  vat_percentage: Number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  replacement_days: Number;

  @Column({
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  refundable_days: Number;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  default_ord_commission: Number;

  @Column({
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  })
  default_bank_commission: Number;

  @Column({
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  current_active: Boolean;

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

import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { MeasurementAttributes, RequiredMeasurementAttributes } from './interfaces/measurement.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'measurement',
})
export default class Measurement extends Model<MeasurementAttributes, RequiredMeasurementAttributes> {
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
  unit_name: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  unit_short_name: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  status: string;

  @CreatedAt
  created_at: Date;

  @UpdatedAt
  updated_at: Date;

  @DeletedAt
  deleted_at: Date;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  unit_name_ar: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  unit_short_name_ar: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  unit_name_ur: string;

  @Column({
    allowNull: false,
    type: DataTypes.STRING,
  })
  unit_short_name_ur: string;

  readonly toJSON = () => {
    const values = Object.assign({}, this.get());
    return values;
  };
}

import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { FaqAttributes, RequiredFaqAttributes } from './interfaces/faq.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'faq',
})
export default class Faq extends Model<FaqAttributes, RequiredFaqAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  question_en: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  answer_en: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  question_ar: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  answer_ar: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  question_ur: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  answer_ur: string;

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

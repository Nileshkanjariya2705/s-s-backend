import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { CmsReviewAttributes, RequiredCmsReviewAttributes } from './interfaces/cmsReview.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'cms_review',
})
export default class CmsReview extends Model<CmsReviewAttributes, RequiredCmsReviewAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.INTEGER,
  })
  rating: number;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  card_description_en: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  customer_name_en: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  customer_name_ar: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  customer_name_ur: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  customer_designation_en: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  customer_designation_ar: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  customer_designation_ur: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  card_description_ar: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  card_description_ur: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  profile_image: string;

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

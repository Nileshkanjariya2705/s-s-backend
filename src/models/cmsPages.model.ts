import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { CmsPagesAttributes, RequiredCmsPagesAttributes } from './interfaces/cmsPages.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'cms_pages',
})
export default class CmsPages extends Model<CmsPagesAttributes, RequiredCmsPagesAttributes> {
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
  page_title: string;

  @Column({
    allowNull: false,
    type: DataTypes.TEXT,
  })
  page_description: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  cms_content_en: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  cms_content_ur: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT('long'),
  })
  cms_content_ar: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  })
  slug: string;

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

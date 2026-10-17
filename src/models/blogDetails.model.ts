import { Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { BlogDetailsAttributes, RequiredBlogDetailsAttributes } from './interfaces/blogDetails';
@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'blog_details',
})
export default class BlogsDetails extends Model<BlogDetailsAttributes, RequiredBlogDetailsAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  title_en: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  body_en: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  title_ar: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  body_ar: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  title_ur: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  body_ur: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  cover_image: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  author_name_en: string;
  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  author_name_ar: string;
  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  author_name_ur: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  author_image: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
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
    // delete values.password;
    return values;
  };
}

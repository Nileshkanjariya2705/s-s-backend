import {
  BelongsTo,
  Column,
  CreatedAt,
  DeletedAt,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DataTypes } from 'sequelize';
import { RequiredRolesAttributes, RolesAttributes } from './interfaces/roles.interface';
import StoreInfo from './storesInfo.model';
import User from './user.model';
import { RequiredSaveCardAttributes, SaveCardAttributes } from './interfaces/saveCard.interface';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'saved_card',
})
export default class SaveCard extends Model<SaveCardAttributes, RequiredSaveCardAttributes> {
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: false,
    type: DataTypes.UUID,
  })
  store_info_uuid: string;
  @BelongsTo(() => StoreInfo, 'store_info_uuid')
  storeInfo: StoreInfo;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  token_id: string;

  @Column({
    type: DataTypes.STRING,
    allowNull: true,
  })
  card_name: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  card_id: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  customer_id: string;

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

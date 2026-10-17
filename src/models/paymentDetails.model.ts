import { BelongsTo, Column, CreatedAt, DeletedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { DataTypes } from 'sequelize';

import Orders from './orders.model';
import { PaymentDetailAttributes, RequiredPaymentDetailAttributes } from './interfaces/paymentDetail.interface';

@Table({
  timestamps: true,
  tableName: 'payment_detail',
  paranoid: true,
})
export default class PaymentDetail extends Model<PaymentDetailAttributes, RequiredPaymentDetailAttributes> {
  [x: string]: any;
  @Column({
    primaryKey: true,
    allowNull: false,
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  })
  uuid: string;

  @Column({
    allowNull: true,
    type: DataTypes.UUID,
  })
  order_id: string;
  @BelongsTo(() => Orders, 'order_id')
  orders: Orders;

  @Column({
    allowNull: true,
    type: DataTypes.ENUM('SUCCESS', 'FAILED', 'PENDING'),
  })
  payment_status: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  payment_method_type: string;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  amount: number;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  charge_id: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  payer_email: string;

  @Column({
    allowNull: true,
    type: DataTypes.STRING,
  })
  payer_name: string;

  @Column({
    allowNull: true,
    type: DataTypes.BIGINT,
  })
  order_payment_timestamp: number;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  customer_id: string;

  @Column({
    allowNull: true,
    type: DataTypes.BOOLEAN,
  })
  payed_by_save_card: boolean;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  tap_order_id: string;

  @Column({
    allowNull: true,
    type: DataTypes.TEXT,
  })
  card_id: string;

  @Column({
    allowNull: true,
    type: DataTypes.FLOAT,
  })
  confirm_amount_payed: number;

  @Column({
    allowNull: true,
    type: DataTypes.JSON,
  })
  tap_payment_response: JSON;

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
  month: any;
}

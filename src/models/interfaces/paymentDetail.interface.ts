import { RequiredKey } from './common.interface';
export interface PaymentDetailAttributes {
  uuid: string;

  order_id: string;

  payment_status: string;

  amount: number;

  charge_id : string

  payment_ref_number: string;

  payment_method_type: string;

  payer_email:string

  payer_name:string

  order_payment_timestamp:number

  customer_id:string

  payed_by_save_card:boolean

  tap_order_id:string

  card_id:string

  confirm_amount_payed:number

  tap_payment_response:JSON

  created_at: Date;

  updated_at: Date;

  deleted_at: Date;
}

export type RequiredPaymentDetailAttributes = RequiredKey<PaymentDetailAttributes, 'uuid'>;

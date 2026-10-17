import PaymentDetail from '@/models/paymentDetails.model';
import { Request } from 'express';

export interface BuildPaymentDetailArgs {
  data: Request['body'];
  action: 'create' | 'update';
  paymentDetail?: PaymentDetail;
}

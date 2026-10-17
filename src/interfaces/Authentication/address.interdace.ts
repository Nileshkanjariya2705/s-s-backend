import Address from '@/models/address.model';
import { Request } from 'express';

export interface BuildAddressArgs {
  data: Request['body'];
  action: 'create' | 'update';
  address?: Address;
}

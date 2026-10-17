// export interface sheetorderType {
//   count: number;
//   rows: orderSupplierInfo[];
// }
// export interface orderSupplierInfo {
//   uuid: string;
//   company_name: string;
//   cr_number: number;
//   tax_number: string;
//   iban_number: string;
//   address: string | null;
//   is_verified: boolean;
//   is_active: boolean;
//   Ord_Commission: number;
//   Bank_Commission: number;
//   created_at: string;
//   updated_at: string;
//   deleted_at: string | null;
//   Orders: allOrderInfoOfSupplier[];
// }

// export interface allOrderInfoOfSupplier {
//   uuid: string;
//   created_by: string;
//   purchase_request_id: string;
//   address_id: string;
//   supplier_info_uuid: string;
//   store_info_uuid: string;
//   additional_info: string | null;
//   status: string;
//   payment_mode: string;
//   vat_percentage: number;
//   payment_receipt: null;
//   is_mail_sent: boolean;
//   reason_for_cancel: string | null;
//   replacement_request: boolean;
//   replacement_status: null | string;
//   refund_request: number;
//   refund_accepted_admin: number;
//   refund_accepted_supplier: string | null;
//   created_at: string;
//   updated_at: string;
//   deleted_at: null | string;
//   PaymentDetail: paymentDetailType[];
//   Address: AddressType;
// }
// export interface AddressType {
//   address: string;
//   Country: string;
//   state: string;
//   city: string;
//   postal_code: number;
//   is_default: boolean | undefined;
//   address_uuid: string | undefined;
//   Phone: string;
//   isEditable: boolean | undefined;
// }

// export interface paymentDetailType {
//   uuid: string;
//   order_id: string;
//   payment_status: string;
//   payment_method_type: string;
//   amount: number;
//   charge_id: string;
//   created_at: string;
//   updated_at: string;
//   deleted_at: null | string;
// }

interface Address {
  uuid: string;
  user_uuid: string;
  entity_info_uuid: string;
  entity_type: string;
  address: string;
  city: string;
  country: string;
  state: string;
  postal_code: number;
  phone: number;
  is_default: boolean;
}

interface PaymentDetail {
  uuid: string;
  order_id: string;
  payment_status: string;
  payment_method_type: string;
  amount: number;
  charge_id: string;
  created_at: string;
}

interface RefundOrderProduct {
  uuid: string;
  refund_order_uuid: string;
  order_uuid: string;
  order_product_uuid: string;
  product_uuid: string;
  reason: string | null;
  refund_product_status: string;
}

interface RefundOrder {
  uuid: string;
  order_uuid: string;
  refundable_amount: number;
  order_amount_left: number;
  RefundOrderProducts: RefundOrderProduct[];
}

interface OrderProduct {
  uuid: string;
  order_id: string;
  product_uuid: string | null;
  quote_id: string;
  price: string;
  quantity: number;
  replacement_reason: string | null;
  replacement_request: boolean;
  refund_request: boolean;
  refund_reason: string | null;
}

export interface orderDetail {
  uuid: string;
  created_by: string;
  amount_without_vat:number
  purchase_request_id: string;
  address_id: string;
  store_info_uuid: string;
  supplier_info_uuid: string;
  additional_info: any;
  status: string;
  payment_mode: string;
  payment_receipt: any;
  vat_percentage: number;
  is_mail_sent: boolean;
  reason_for_cancel: string | null;
  replacement_request: boolean;
  replacement_status: string | null;
  refund_request: boolean;
  refund_accepted_admin: boolean;
  refund_accepted_supplier: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  PaymentDetail: PaymentDetail[];
  address: Address;
  OrderProducts: OrderProduct[];
  RefundOrders: RefundOrder[];
  OrderReplacement: any[];
}

export interface orderSupplierInfo {
  uuid: string;
  company_name: string;
  cr_number: string;
  tax_number: string;
  iban_number: string;
  address: string;
  is_verified: boolean;
  is_active: boolean;
  Ord_Commission: number;
  Bank_Commission: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  Orders: orderDetail[];
}

interface Data {
  count: number;
  rows: orderSupplierInfo[];
}

interface GeneratedTS {
  data: Data;
}

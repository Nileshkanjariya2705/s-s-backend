import { Op } from "sequelize";

export interface Supplier {
  label: string;
  value: string;
}

export interface PurchaseHistoryItem {
  uuid: string;
  orders: {
    supplierInfo: {
      uuid: string;
      company_name: string;
    };
  };
}
export interface PaymentWhere {
  [key: string]: string | { [Op.like]: string } | { [Op.gte]: string } | { [Op.lte]: string };
  payment_status: string;
}

export interface OrderWhere {
  store_info_uuid: string;
  status?: string;
  replacement_request?: boolean;
  refund_request?: boolean;
}


export interface PaymentDetails {
    uuid: string;
    order_id: string;
    payment_status: string;
    amount: number;
    created_at: Date;
  }
  
 export interface OrderDetail {
    vat_percentage: number;
    uuid: string;
    created_by: string;
    supplier_info_uuid: string;
    purchase_request_id: string;
    status?: string;
    replacement_request?: boolean;
    refund_request?: boolean;
  }
  
 export interface OrderProduct {
    product_uuid: string;
    supplierProductQuotes: SupplierProductQuotes | null;
  }
  
 export interface SupplierProductQuotes {
    // Define properties as needed
  }
  
 export interface Review {
    rating: number;
    reviews: string;
  }
  
 export interface Product {
    uuid: string;
    name_en: string;
    category_uuid: string;
    measurement_uuid: string;
    featured_image: string;
    name_ar: string;
    name_ur: string;
  }
  
export  interface Category {
    name: string;
    uuid: string;
  }
  
 export interface Measurement {
    unit_name: string;
  }
  
export  interface FinalResponse {
    OrderSummary: {
      userDetail: UserDetail;
      paymentDetails: PaymentDetails;
      orderDetail: OrderDetail;
      ratings: Review | '';
      Qr_code: string;
    };
    replacement_available: boolean;
    refund_request: boolean;
    OrderProducts: OrderProduct[];
  }
  
  export interface UserDetail {
    username: string;
    email: string;
  }
  
  export interface ErrorResponse {
    message: string;
  }

  
 export interface InvoiceOptions {
    sellerName: string;
    vatRegistrationNumber: string;
    invoiceTimestamp: string;
    invoiceTotal: string;
    invoiceVatTotal: string;
  }
  
  
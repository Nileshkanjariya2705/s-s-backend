interface ApiParams {
  limit: string;
  page: string;
  searchText: string;
  sort: string;
  isAsc: string;
  extraParams?: ExtraParams;
}

interface ExtraParams {
  expiry_date?: [string, string];
  purchaseRequest_uuid?: string;
  status?: string;
  hasOffers?: 'YES' | 'NO';
}

interface PurchaseRequestSearchParams {
  searchText: string;
  purchaseRequest_uuid?: string;
}

interface PurchaseRequestExtraParams {
  expiry_date?: [string, string];
  hasOffers?: 'YES' | 'NO';
}
interface PurchaseRequestResponse {
    rows: PurchaseRequests[];
    count: number;
  }
  

interface PurchaseRequests {
    total_price: number; quotes_accepted_upto: Date; uuid: string; status: string
}
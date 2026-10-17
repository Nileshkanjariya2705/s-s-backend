import SupplierQuotes from "@/models/supplierQuotes.model";
import { Request } from "express";

export interface BuildSupplierQuotesArgs {
  data: Request['body'] ;
  action: 'create' | 'update';
  supplierQuotes?: SupplierQuotes;
}

import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import BaseRepository from '../base.repository';
import { BuildSupplierProductsArgs } from '@/interfaces/SupplierProductQuotes/supplierProductQuotes.interface';

export default class SupplierProductQuotesRepo extends BaseRepository<SupplierProductQuotes> {
  constructor() {
    super(SupplierProductQuotes.name);
  }
  readonly createSupplierProductQuotes = async (
    supplierProductQuotesArgs: BuildSupplierProductsArgs,
    extraParam: { transaction },
  ) => {
    const { data } = supplierProductQuotesArgs;

    const { transaction } = extraParam;

    const supplierProductQuote = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return supplierProductQuote;
  };
}

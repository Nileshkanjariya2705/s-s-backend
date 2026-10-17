import { BuildSupplierQuotesArgs } from '@/interfaces/SupplierQuote/supplierQuotes.interface';
import BaseRepository from '../base.repository';
import SupplierQuotes from '@/models/supplierQuotes.model';

export default class SupplierQuotesRepo extends BaseRepository<SupplierQuotes> {
  constructor() {
    super(SupplierQuotes.name);
  }

  readonly createSupplierQuote = async (
    supplierProductCreateArgs: BuildSupplierQuotesArgs,
    extraParam: { transaction },
  ) => {
    const { data } = supplierProductCreateArgs;

    const { transaction } = extraParam;

    const supplierQuote = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return supplierQuote;
  };

}

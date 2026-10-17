import BaseRepository from '../base.repository';
import { BuildSupplierInfoArgs } from '@/interfaces/Authentication/supplierInfo.interface';
import SupplierInfo from '@/models/supplierinfo.model';

export default class SupplierInfoRepo extends BaseRepository<SupplierInfo> {
  constructor() {
    super(SupplierInfo.name);
  }
  readonly createSupplier = async (supplierInfoArgs: BuildSupplierInfoArgs, extraParam: { transaction }) => {
    const { data } = supplierInfoArgs;
    const { transaction } = extraParam;

    const supplierInfo = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return supplierInfo;
  };
  //   readonly getUserAccount = ({ email }: { email: string }, extraParam: { transaction }) => {
  //     return this.get({
  //       where: { email: email },
  //       transaction: extraParam.transaction,
  //     });
  //   };
}

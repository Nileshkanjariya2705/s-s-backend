import BaseRepository from '../base.repository';
import Address from '@/models/address.model';
import { BuildAddressArgs } from '@/interfaces/Authentication/address.interdace';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class AddressRepo extends BaseRepository<Address> {
  constructor() {
    super(Address.name);
  }

  readonly createAddress = async (addressArgs: BuildAddressArgs, extraParam: { transaction }) => {
    const { data } = addressArgs;
    const { transaction } = extraParam;

    const storeInfo = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return storeInfo;
  };
}

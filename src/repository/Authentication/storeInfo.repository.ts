import { BuildStoreInfoArgs } from '@/interfaces/Authentication/storeInfo.interface';
import BaseRepository from '../base.repository';
import StoreInfo from '@/models/storesInfo.model';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class StoreInfoRepo extends BaseRepository<StoreInfo> {
  constructor() {
    super(StoreInfo.name);
  }
  readonly createStoreInfo = async (createStoreInfoArgs: BuildStoreInfoArgs, extraParam: { transaction }) => {
    const { data } = createStoreInfoArgs;
    const { transaction } = extraParam;

    const storeInfo = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return storeInfo;
  };
  readonly getStoreInfo = async () => {
    const storeInfo = await this.getAll({
      raw: true,
    });
    return storeInfo;
  };
  readonly updateStoreInfo = async (accountCreateArgs: Required<BuildStoreInfoArgs>) => {
    const { data, StoreInfo } = accountCreateArgs;
    return db.transaction(async (transaction) => {
      const buildStoreInfo = setInstance({ ...data }, StoreInfo);
      await buildStoreInfo.save({ transaction });
      return buildStoreInfo;
    });
  };
}

import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import PurchaseRequests from '@/models/purchaseRequest.model';
import { BuildPurchaseRequestsArgs } from '@/interfaces/PurchaseRequest/purchaseRequest.interface';

export default class PurchaseRequestRepo extends BaseRepository<PurchaseRequests> {
  constructor() {
    super(PurchaseRequests.name);
  }
  readonly createRequest = async (
    purchaseRequestCreateArgs: BuildPurchaseRequestsArgs,
    extraParam: { transaction },
  ) => {
    const { data } = purchaseRequestCreateArgs;

    const { transaction } = extraParam;

    const purchaseRequest = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return purchaseRequest;
  };

  readonly updateRequest = async (productsArgs: Required<BuildPurchaseRequestsArgs>) => {
    const { data, purchaseReq } = productsArgs;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, purchaseReq);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };
}

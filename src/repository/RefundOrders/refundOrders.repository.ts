import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import { BuildPurchaseRequestsArgs } from '@/interfaces/PurchaseRequest/purchaseRequest.interface';
import RefundOrders from '@/models/refundOrders.model';

export default class RefundOrdersRepo extends BaseRepository<RefundOrders> {
  constructor() {
    super(RefundOrders.name);
  }
  readonly createRefundOrders = async (
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

  readonly updateRefundOrders = async (productsArgs: Required<BuildPurchaseRequestsArgs>) => {
    const { data, purchaseReq } = productsArgs;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, purchaseReq);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };
}

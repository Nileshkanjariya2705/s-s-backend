import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import BaseRepository from '../base.repository';
import { BuildProductPurchaseRequestsArgs } from '@/interfaces/ProductPurchaseRequest/productPuchaseRequest.interface';

export default class PurchaseRequestProductsRepo extends BaseRepository<PurchaseRequestProducts> {
  constructor() {
    super(PurchaseRequestProducts.name);
  }
  readonly createPurchaseRequestProduct = async (
    purchaseRequestProductCreateArgs: BuildProductPurchaseRequestsArgs,
    extraParam: { transaction },
  ) => {
    const { data } = purchaseRequestProductCreateArgs;

    const { transaction } = extraParam;

    const purchaseRequestProduct = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return purchaseRequestProduct;
  };
}

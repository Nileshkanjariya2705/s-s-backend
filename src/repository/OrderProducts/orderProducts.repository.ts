import BaseRepository from '../base.repository';
import OrderProducts from '@/models/orderProduct.model';
import { BuildOrderProductRequestArgs } from '@/interfaces/OrderProducts/orderProducts.interface';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class OrderProductsRepo extends BaseRepository<OrderProducts> {
  constructor() {
    super(OrderProducts.name);
  }

  readonly createOrderProductRequest = async (
    orderProducts: BuildOrderProductRequestArgs,
    extraParam: { transaction },
  ) => {
    const { data } = orderProducts;
    const { transaction } = extraParam;

    const order = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return order;
  };

  readonly updateOrderProduct = async (orderProducts: Required<BuildOrderProductRequestArgs>) => {
    const { data, orderProduct } = orderProducts;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, orderProduct);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };
}

import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import Products from '@/models/products.model';
import { BuildProductsArgs } from '@/interfaces/Products/products.interface';

export default class ProductsRepo extends BaseRepository<Products> {
  constructor() {
    super(Products.name);
  }
  readonly createProduct = async (productsCreateArgs: BuildProductsArgs, extraParam: { transaction }) => {
    const { data } = productsCreateArgs;

    const { transaction } = extraParam;

    const product = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return product;
  };

  readonly updateProduct = async (productsArgs: Required<BuildProductsArgs>) => {
    const { data, Products } = productsArgs;
    return db.transaction(async (transaction) => {
      const buildProduct = setInstance({ ...data }, Products);
      await buildProduct.save({ transaction });
      return buildProduct;
    });
  };
  readonly checkProductIsAcitve = async (product_uuid, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkProduct = await this.get({
      where: {
        uuid: product_uuid,
        status: 'active',
      },
      transaction: transaction,
    });
    return checkProduct ? true : false;
  };
}

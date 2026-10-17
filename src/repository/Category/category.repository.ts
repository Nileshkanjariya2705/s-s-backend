import BaseRepository from '../base.repository';

import Category from '@/models/category.model';
import { BuildCategoryArgs } from '@/interfaces/Category/category.interface';

export default class CategoryRepo extends BaseRepository<Category> {
  constructor() {
    super(Category.name);
  }
  readonly createCategory = async (createCategoryArgs, extraParam: { transaction }) => {
    const { data } = createCategoryArgs;
    const { transaction } = extraParam;

    const createCategory = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return createCategory;
  };
  readonly checkCategoryIsAcitve = async (category_uuid, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkCategory = await this.get({
      where: {
        uuid: category_uuid,
        status: 'active',
      },
      transaction: transaction,
    });
    return checkCategory ? true : false;
  };
  readonly getActiveCategory = async (attributes, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkCategory = await this.getAllData({
      where: {
        status: 'active',
      },
      attributes: attributes,
      transaction: transaction,
    });
    return checkCategory;
  };
  readonly getCategoryList = async (extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkCategory = await this.getAllData({
      transaction: transaction,
    });
    return checkCategory;
  };
}

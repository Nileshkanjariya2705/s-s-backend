import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import SupplierProducts from '@/models/supplierProducts.model';
import { BuildSuppplierProductsArgs } from '@/interfaces/SupplierProducts/supplierProducts.interface';
import Products from '@/models/products.model';
import { Op } from 'sequelize';
import Category from '@/models/category.model';
import Measurement from '@/models/measurement.model';
import moment, { max } from 'moment';

export default class SupplierProductsRepo extends BaseRepository<SupplierProducts> {
  constructor() {
    super(SupplierProducts.name);
  }

  readonly createSupplierProduct = async (
    supplierproductsCreateArgs: BuildSuppplierProductsArgs,
    extraParam: { transaction },
  ) => {
    const { data } = supplierproductsCreateArgs;

    const { transaction } = extraParam;

    const supplierProduct = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return supplierProduct;
  };

  readonly updateSupplierProduct = async (supplierProductsArgs: Required<BuildSuppplierProductsArgs>) => {
    const { data, SupplierProducts } = supplierProductsArgs;
    return db.transaction(async (transaction) => {
      const buildProduct = setInstance({ ...data }, SupplierProducts);
      await buildProduct.save({ transaction });
      return buildProduct;
    });
  };

  readonly getCategoryWiseProduct = async ({
    order,
    minPrice,
    maxPrice,
    categoriesId,
    searchText,
    lang,
  }: {
    order: [];
    minPrice?: string;
    maxPrice?: string;
    categoriesId: string[];
    searchText: string;
    lang: string;
  }) => {
    const now = moment().format('YYYY-MM-DD HH:mm:ss');
    let where;
    if (minPrice && maxPrice) {
      where = {
        [Op.and]: [
          // {
          //   is_purchaseable: true,
          // },
          {
            price: {
              [Op.between]: [Number(minPrice), Number(maxPrice)],
            },
          },
        ],
        end_date: {
          [Op.gt]: now,
        },
      };
    } else {
      where = {
        // is_purchaseable: true,
        end_date: {
          [Op.gt]: now,
        },
      };
    }

    const AllProducts = await SupplierProducts.findAll({
      attributes: ['price', 'end_date', 'units', 'supplier_uuid', 'uuid', 'supplier_info_uuid'],
      where: where,
      include: [
        {
          model: Products,
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at', 'status'] },
          where: {
            ...(categoriesId.length > 0 && { category_uuid: categoriesId }),
            [`name_${lang}`]: {
              [Op.like]: `%${searchText}%`,
            },
          },
          include: [
            {
              model: Category,
              attributes: ['name', 'uuid', 'name_ur', 'name_ar'],
              where: {
                uuid: categoriesId,
              },
            },
            {
              model: Measurement,
              attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
            },
          ],
        },
      ],
      order: order,
    });

    return AllProducts;
  };

  readonly getCategoriesWiseProducts = async ({
    order,
    minPrice,
    maxPrice,
    categoriesId,
    searchText,
    lang,
    page,
    limit,
  }: {
    order: [];
    minPrice?: string;
    maxPrice?: string;
    categoriesId: string[];
    searchText: string;
    lang: string;
    page: string;
    limit: string;
  }) => {
    let where;
    if (minPrice && maxPrice) {
      where = {
        price: {
          [Op.between]: [Number(minPrice), Number(maxPrice)],
        },
      };
    }

    const AllProducts = await SupplierProducts.findAndCountAll({
      attributes: ['price', 'end_date', 'units', 'supplier_uuid'],
      where: where,
      include: [
        {
          model: Products,
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at', 'status'] },
          where: {
            ...(categoriesId.length > 0 && { category_uuid: categoriesId }),
            [`name_${lang}`]: {
              [Op.like]: `%${searchText}%`,
            },
          },
          include: [
            {
              model: Category,
              attributes: ['name'],
              where: {
                uuid: categoriesId,
              },
            },
            {
              model: Measurement,
              attributes: ['unit_name'],
            },
          ],
        },
      ],
      order: order,
      limit: +limit,
      offset: (+page - 1) * +limit,
    });

    return AllProducts;
  };
}

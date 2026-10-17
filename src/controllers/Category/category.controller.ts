import { generalResponse, responseType } from '@/helper/common.helper';
import { CATEGORY_MESSAGES, PRODUCT_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import Category from '@/models/category.model';
import Measurement from '@/models/measurement.model';
import Products from '@/models/products.model';
import StoreProductReviews from '@/models/storeProductReviews.model';
import SupplierProducts from '@/models/supplierProducts.model';
import CategoryRepo from '@/repository/Category/category.repository';
import ProductsRepo from '@/repository/Products/products.repository';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import { NextFunction, query, Request, Response } from 'express';
import moment from 'moment';

import { col, fn, Op, Sequelize } from 'sequelize';

export class CategoryController {
  constructor(
    private readonly categoryRepository: CategoryRepo,
    private readonly productsRepository: ProductsRepo,
    private readonly supplierProductsRepository: SupplierProductsRepo,
  ) {}
  public readonly createCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const createData = {
        image: req?.['file']?.filename,
        name: req?.body?.name,
        status: req?.body?.status,
        name_ar: req?.body?.name_ar,
        name_ur: req?.body?.name_ur,
      };
      const findCategory = await this.categoryRepository.get({
        where: {
          [Op.or]: [
            {
              name: req?.body?.name,
            },
            {
              name_ar: req?.body?.name_ar,
            },
            {
              name_ur: req?.body?.name_ur,
            },
          ],
        },
      });
      if (findCategory) {
        return generalResponse(res, null, CATEGORY_MESSAGES?.CATEGORY_DUPLICATED, responseType.FAILURE, true, 200);
      }
      let createCategoryInfo;
      const result = await db.transaction(async (t) => {
        createCategoryInfo = await this.categoryRepository.createCategory(
          {
            data: {
              ...createData,
            },
            action: 'create',
          },
          { transaction: t },
        );
      });
      return generalResponse(
        res,
        createCategoryInfo,
        CATEGORY_MESSAGES?.CATEGORY_ADDED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiParams = req.query;
      const { page, limit, sort, isAsc, searchText } = apiParams;
      const isOrderAsc = isAsc === 'true';
      let order;
      if (sort) {
        if (sort === 'name' || sort === 'status') {
          order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
        }
      }

      let srch = {};

      if (searchText) {
        srch = {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              name_ar: {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              name_ur: {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              status: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }

      const getAllCategories: { rows: Category[]; count: number } = await this.categoryRepository.getAllData({
        attributes: { exclude: ['updated_at', 'deleted_at', 'created_at'] },
        where: { ...srch },
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
        raw: true,
      });

      const getAllProducts: [] | number = await this.productsRepository.getCount({
        group: ['category_uuid'],
      });

      let uuidToRecordMap = {};
      getAllCategories?.rows?.forEach((record) => {
        uuidToRecordMap[record.uuid] = record;
      });

      getAllProducts &&
        Array.isArray(getAllProducts) &&
        getAllProducts?.forEach((item) => {
          const matchingRecord = uuidToRecordMap[item.category_uuid];

          if (matchingRecord) {
            matchingRecord['product_count'] = item.count;
          }
        });

      const resultArray = Object.values(uuidToRecordMap);
      for (const category of resultArray) {
        if (!category.hasOwnProperty('product_count')) {
          category['product_count'] = 0;
        }
      }

      return generalResponse(
        res,
        getAllCategories,
        CATEGORY_MESSAGES?.CATEGORY_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllCategoriesListing = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { searchText } = apiParams as { searchText: string };
      let srch = {};
      if (searchText) {
        srch = {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      const getAllCategories: { rows: Category[]; count: number } = await this.categoryRepository.getAllData({
        where: {
          status: 'active',
          ...srch,
        },
        attributes: { exclude: ['status', 'created_at', 'updated_at', 'deleted_at'] },
      });
      return generalResponse(
        res,
        getAllCategories,
        CATEGORY_MESSAGES?.CATEGORY_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllProductsCategoryWise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { searchText } = apiParams as { searchText: string };
      let srch = {};
      if (searchText) {
        srch = {
          [Op.or]: [
            {
              name: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      const allsupplierProducts = await this.supplierProductsRepository.getAllData({
        include: [
          {
            model: Products,
            attributes: ['name_en', 'uuid', 'name_ar', 'name_ur', 'featured_image'],
            include: [{ model: Measurement, attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'] }],
          },
        ],
        where: {
          end_date: {
            [Op.gt]: now,
          },
        },
        limit: 12,
      });
      const productId = [];
      const supId = [];

      allsupplierProducts.rows.map(
        (item) => productId.push(item.dataValues.product_uuid) && supId.push(item.dataValues.supplier_info_uuid),
      );
      const supplierProducts = allsupplierProducts.rows.filter((item) => item.product !== null);

      const ratingOfProduct: any = await StoreProductReviews.findAll({
        attributes: [[fn('AVG', col('rating')), 'averageRating'], 'product_uuid', 'supplier_info_uuid'],
        where: {
          product_uuid: {
            [Op.in]: [...new Set(productId)],
          },
          supplier_info_uuid: {
            [Op.in]: [...new Set(supId)],
          },
        },
        group: ['product_uuid', 'supplier_info_uuid'],
      });
      let finalResponse = {
        supplierProducts: {
          count: allsupplierProducts.count,
          rows: supplierProducts,
        },
        ratingOfProduct,
      };
      return generalResponse(res, finalResponse, CATEGORY_MESSAGES?.CATEGORY_FETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly updateCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updateableData = {
        image: req?.['file']?.filename,
        name: req?.body?.name,
        name_ar: req?.body?.name_ar,
        name_ur: req?.body?.name_ur,
        status: req?.body?.status,
      };

      const findCategory = await Category.findOne({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  name: req?.body?.name,
                },
                {
                  name_ar: req?.body?.name_ar,
                },
                {
                  name_ur: req?.body?.name_ur,
                },
              ],
            },
            {
              uuid: {
                [Op.ne]: req?.params?.categoryId,
              },
            },
          ],
        },
      });

      if (findCategory) {
        return generalResponse(res, null, CATEGORY_MESSAGES?.CATEGORY_DUPLICATED, responseType.FAILURE, true, 200);
      }

      const updateCategory = await Category.update(
        { ...updateableData },

        {
          where: {
            uuid: req?.params?.categoryId,
          },
        },
      );

      return generalResponse(res, updateCategory, CATEGORY_MESSAGES?.CATEGORY_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSpecificCategory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getCategory = await this.categoryRepository.get({ where: { uuid: req?.params?.categoryId } });
      return generalResponse(res, getCategory, CATEGORY_MESSAGES?.CATEGORY_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteCategory = async (req: Request, res: Response) => {
    try {
      const { categoryId } = req.params;
      const getAllProducts: [] | number = await this.productsRepository.getCount({
        where: { category_uuid: categoryId },
      });

      if (getAllProducts === 0) {
        const findCategory = await this.categoryRepository.get({
          where: {
            uuid: categoryId,
          },
        });
        if (!findCategory) {
          return generalResponse(
            res,
            null,
            CATEGORY_MESSAGES?.CATEGORY_COULD_NOT_FIND,
            responseType.FAILURE,
            true,
            200,
          );
        }
        const updateCategory = await Category.destroy({
          where: {
            uuid: categoryId,
          },
        });
        return generalResponse(
          res,
          updateCategory,
          CATEGORY_MESSAGES?.CATEGORY_DELETED,
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(res, null, CATEGORY_MESSAGES?.CATEGORY_CAN_NOT_DELETED, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly categoryWiseProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let order;
      let minPrice, maxPrice;

      const { sortBy, searchText, lang, categoriesId } = req.body.data;

      const priceRange = req.body.data.priceRange as string;
      if (priceRange.includes('-')) {
        [minPrice, maxPrice] = priceRange.split('-');
      } else if (priceRange.includes('+')) {
        minPrice = priceRange.replace('+', '');
        maxPrice = Number.MAX_SAFE_INTEGER;
      }

      if (sortBy) {
        if (sortBy === 'low-to-high') {
          order = [[Sequelize.cast(Sequelize.col('price'), 'DECIMAL'), 'ASC']];
        } else if (sortBy === 'high-to-low') {
          order = [[Sequelize.cast(Sequelize.col('price'), 'DECIMAL'), 'DESC']];
        } else if (sortBy === 'recently-added') {
          order = [['created_at', 'DESC']];
        }
      }

      const findCategory = await this.categoryRepository.getAll({
        where: {
          uuid: categoriesId,
        },
      });

      if (findCategory) {
        const AllProducts = await this.supplierProductsRepository.getCategoryWiseProduct({
          order,
          minPrice,
          maxPrice,
          categoriesId,
          searchText,
          lang,
        });
        const categoryData = {};
        AllProducts.length > 0 &&
          AllProducts.forEach((product: any) => {
            const categoryName = product.product.category.uuid;

            if (!categoryData[categoryName]) {
              categoryData[categoryName] = {
                name: categoryName,
                product_data: [],
                category_en: product.product.category.name,
                category_ur: product.product.category.name_ur,
                category_ar: product.product.category.name_ar,
              };
            }

            categoryData[categoryName].product_data.push({
              name_en: product.product.name_en,
              name_ur: product.product.name_ur,
              name_ar: product.product.name_ar,
              price: product.price,
              units: product.units,
              end_date: product.end_date,
              supplier_uuid: product.supplier_uuid,
              uuid: product.product_uuid,
              featured_image: product.product.featured_image,
              unit_name_en: product.product.measurement.unit_name,
              unit_name_ar: product.product.measurement.unit_name_ar,
              unit_name_ur: product.product.measurement.unit_name_ur,
              product_uuid: product.product.uuid,
              supplierProdId: product.uuid,
              supplier_info_uuid: product.supplier_info_uuid,
            });
          });
        const ratingOfProduct: any = await StoreProductReviews.findAll({
          attributes: [[fn('AVG', col('rating')), 'averageRating'], 'product_uuid', 'supplier_info_uuid'],

          group: ['product_uuid', 'supplier_info_uuid'],
        });
        return generalResponse(
          res,
          { categoryData, ratingOfProduct },
          CATEGORY_MESSAGES?.CATEGORY_WISE_PRODUCT,
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_COULD_NOT_FIND, responseType.FAILURE, false, 400);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getProductsCategoriesWise = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let order;
      let minPrice, maxPrice;

      const { sortBy, categoriesId }: { sortBy?: string; categoriesId?: string[] } = req.query;

      const { searchText, lang, page, limit }: { searchText?: string; lang?: string; page?: string; limit?: string } =
        req.query;
      const priceRange = req.query.priceRange as string;
      if (priceRange.includes('-')) {
        [minPrice, maxPrice] = priceRange.split('-');
      } else if (priceRange.includes('+')) {
        minPrice = priceRange.replace('+', '');
        maxPrice = Number.MAX_SAFE_INTEGER;
      }
      if (sortBy) {
        if (sortBy === 'low-to-high') {
          order = [[Sequelize.literal('price'), 'ASC']];
        } else if (sortBy === 'high-to-low') {
          order = [[Sequelize.literal('price'), 'DESC']];
        } else if (sortBy === 'recently-added') {
          order = [['created_at', 'DESC']];
        }
      }
      const findCategory = await this.categoryRepository.getAll({
        where: {
          uuid: categoriesId as string[],
        },
      });

      if (findCategory) {
        const AllProducts = await this.supplierProductsRepository.getCategoriesWiseProducts({
          order,
          minPrice,
          maxPrice,
          categoriesId,
          searchText,
          lang,
          page,
          limit,
        });

        return generalResponse(
          res,
          AllProducts,
          CATEGORY_MESSAGES?.CATEGORY_WISE_PRODUCT,
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_COULD_NOT_FIND, responseType.FAILURE, false, 400);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await this.supplierProductsRepository.getAllData({
        include: [
          {
            model: Products,
            include: [
              {
                model: Measurement,
              },
            ],
          },
        ],

        attributes: { exclude: ['created_at', 'deleted_at', 'updated_at'] },
      });
      return generalResponse(res, response, PRODUCT_MESSAGES.PRODUCTS_FETCHED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import { NextFunction, Request, Response } from 'express';
import { formatDateString, generalResponse, responseType, statusType } from '@/helper/common.helper';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import CategoryRepo from '@/repository/Category/category.repository';
import { CATEGORY_MESSAGES, SUPPLIER_PRODUCTS_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import ProductsRepo from '@/repository/Products/products.repository';
import Products from '@/models/products.model';
import Category from '@/models/category.model';
import SupplierProducts from '@/models/supplierProducts.model';
import Measurement from '@/models/measurement.model';
import { Op } from 'sequelize';
const Sequelize = require('sequelize');
const moment = require('moment');

export class SupplierProductsController {
  constructor(
    private readonly supplierProductsRepository: SupplierProductsRepo,
    private readonly categoryRepository: CategoryRepo,
    private readonly productRepository: ProductsRepo,
  ) {}
  public readonly getAllCategories = async (req: Request, res: Response) => {
    try {
      await db.transaction(async (t) => {
        let categoryName = null;
        const { category_uuid, language } = req.query as { category_uuid: string; language: 'en' | 'ar' | 'ur' };
        if (category_uuid) {
          categoryName = await this.categoryRepository.get({
            where: {
              uuid: category_uuid as string,
            },
            attributes: ['name', 'uuid'],
          });
        }
        const categoryList = await this.categoryRepository.getActiveCategory(['name', 'name_ar', 'name_ur', 'uuid'], {
          transaction: t,
        });
        const categoryListInfo = [];

        if (categoryName) {
          const checkIsPresent = categoryList.rows.find((item) => item.uuid === categoryName?.uuid);
          if (!checkIsPresent) {
            categoryListInfo.push({
              label: categoryName['name'],
              value: categoryName['uuid'],
            });
          }
        }
        if (categoryList) {
          categoryList.rows.forEach((data) => {
            categoryListInfo.push({
              label:data[`name_${language}`] ?? data[`name`],
              value: data['uuid'],
            });
          });
        }
        return generalResponse(
          res,
          categoryListInfo,
          CATEGORY_MESSAGES?.CATEGORY_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllProducts = async (req: Request, res: Response) => {
    const { language } = req.query;
    try {
      const productList = await this.categoryRepository.getAllData({
        attributes: ['uuid'],
        include: {
          model: Products,
          attributes: [`name_${language}`, 'uuid'],
          where: {
            status: statusType.ACTIVE,
          },
        },
      });
      const data = {};
      productList.rows.forEach((item) => {
        const category = item.uuid;
        const products = item.products.map((i) => ({ value: i.uuid, label: i[`name_${language}`] }));
        data[category] = products;
      });
      return generalResponse(res, data, SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getCategoryWiseProduct = async (req: Request, res: Response) => {
    try {
      let where;
      const { language } = req.query;
      if (req.query.product_uuid) {
        where = {
          category_uuid: req.params.categoryId,
        };
      } else {
        where = {
          category_uuid: req.params.categoryId,
          status: statusType.ACTIVE,
        };
      }
      const productList = await this.productRepository.getAllData({
        attributes: [`name_${language}`, 'uuid'],
        where: where,
      });
      const productListInfo = [];
      if (productList) {
        productList.rows.forEach((data) => {
          productListInfo.push({
            label: data[`name_${language}`],
            value: data['uuid'],
          });
        });
      }
      return generalResponse(
        res,
        productListInfo,
        SUPPLIER_PRODUCTS_MESSAGES.CAT_WISE_PRODUCT_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly supplierAddProduct = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { units, product, supplier_uuid, charges } = req.body;
      const findProduct = await this.supplierProductsRepository.get({
        where: {
          product_uuid: product,
          supplier_uuid: supplier_uuid,
          [Op.or]: [
            {
              units: units,
            },
          ],
        },
      });

      if (findProduct) {
        return generalResponse(
          res,
          null,
          SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_ALREADY_EXIST,
          responseType.FAILURE,
          true,
          200,
        );
      }
      const endDate = req.body.end_date;
      const formattedDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');

      await db.transaction(async (t) => {
        await this.supplierProductsRepository.createSupplierProduct(
          {
            data: {
              ...req.body,
              charges: charges === null ? 0 : req.body.charges,
              product_uuid: req.body.product,
              end_date: formattedDate,
              supplier_info_uuid: req.body.user_entity_uuid,
            },
            action: 'create',
          },
          { transaction: t },
        );
        return generalResponse(res, '', SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_ADDED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly supplierEditProduct = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { uuid, units, product, user_entity_uuid, charges } = req.body;
      await db.transaction(async (t) => {
        const getProduct = await this.supplierProductsRepository.get({
          where: {
            uuid: uuid,
          },
        });
        const checkAlreadyExist = await this.supplierProductsRepository.get({
          where: {
            supplier_info_uuid: user_entity_uuid,
            product_uuid: product,
            uuid: {
              [Op.ne]: uuid,
            },
            units: units,
          },
        });
        if (checkAlreadyExist) {
          return generalResponse(
            res,
            null,
            SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_ALREADY_EXIST,
            responseType.FAILURE,
            true,
            200,
          );
        }
        if (getProduct) {
          const endDate = req.body.end_date;
          const formattedDate = moment(endDate).format('YYYY-MM-DD HH:mm:ss');
          const checkProductIsActive = await this.productRepository.checkProductIsAcitve(req?.body?.product, {
            transaction: t,
          });
          const checkProductIsNotDeleted = await this.productRepository.get({
            where: {
              uuid: req?.body?.product,
              deleted_at: null,
            },
          });
          if (!checkProductIsNotDeleted) {
            return generalResponse(
              res,
              null,
              CATEGORY_MESSAGES.CATEGORY_PRODUCT_DELETED,
              responseType.FAILURE,
              true,
              200,
            );
          }
          const checkProductCategoryActive = await this.categoryRepository.checkCategoryIsAcitve(req?.body?.category, {
            transaction: t,
          });
          if (!checkProductCategoryActive) {
            return generalResponse(
              res,
              null,
              CATEGORY_MESSAGES.UPDATE_CATEGORY_INACTIVE,
              responseType.FAILURE,
              true,
              200,
            );
          }
          if (!checkProductIsActive) {
            return generalResponse(
              res,
              null,
              CATEGORY_MESSAGES.CATEGORY_PRODUCT_INACTIVE,
              responseType.FAILURE,
              true,
              200,
            );
          }
          const updateProduct = await SupplierProducts.update(
            {
              charges: charges === null ? 0 : req.body.charges,
              product_uuid: req.body.product,
              end_date: formattedDate,
              ...req.body,
            },
            { where: { uuid: uuid }, transaction: t },
          );
          if (updateProduct) {
            return generalResponse(
              res,
              null,
              SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_UPDATED,
              responseType.SUCCESS,
              true,
              200,
            );
          } else {
            return generalResponse(
              res,
              null,
              SUPPLIER_PRODUCTS_MESSAGES.PRODUCTS_UPDATED_FAILED,
              responseType.FAILURE,
              true,
              200,
            );
          }
        } else {
          return generalResponse(
            res,
            null,
            SUPPLIER_PRODUCTS_MESSAGES.PRODUCTS_FETCHED_FAILED,
            responseType.FAILURE,
            true,
            200,
          );
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAllSupplierProducts = async (req: Request, res: Response) => {
    try {
      const { apiParams, user_entity_uuid, language } = req.query;
      const { page, limit, sort, isAsc, searchText, extraParams } = apiParams as any;
      let srch = {};
      let order = [];

      const isOrderAsc = isAsc === 'true';

      if (searchText) {
        srch = {
          [Sequelize.Op.or]: [
            {
              '$product.name_en$': {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$product.name_ar$': {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$product.name_ur$': {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$product.category.name$': {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$product.status$': {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              price: {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      if (sort === 'product') {
        order.push([Sequelize.col('product.name_en'), isOrderAsc ? 'ASC' : 'DESC']);
      } else if (sort === 'category') {
        order.push([Sequelize.col('product.category.name'), isOrderAsc ? 'ASC' : 'DESC']);
      } else if (sort === 'status') {
        order.push([Sequelize.col('product.status'), isOrderAsc ? 'ASC' : 'DESC']);
      } else if (sort === 'price') {
        order.push([Sequelize.cast(Sequelize.col('price'), 'DECIMAL'), isOrderAsc ? 'ASC' : 'DESC']);
      } else if (sort === 'end_date') {
        order.push([sort, isOrderAsc ? 'ASC' : 'DESC']);
      }
      let supplierProdWhere: any = {
        ...srch,
        supplier_info_uuid: user_entity_uuid as string,
      };
      if (extraParams?.offered_price && extraParams?.created_date) {
        const [expiryDateFrom, expiryDateTo] = extraParams?.created_date || [];
        const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
        const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
        supplierProdWhere = {
          ...srch,
          supplier_info_uuid: user_entity_uuid as string,
          price: extraParams.offered_price,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }
      if (extraParams?.offered_price) {
        supplierProdWhere = {
          ...srch,
          supplier_info_uuid: user_entity_uuid as string,
          price: extraParams.offered_price,
        };
      }
      if (extraParams?.created_date) {
        const [expiryDateFrom, expiryDateTo] = extraParams?.created_date || [];
        const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
        const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
        supplierProdWhere = {
          ...supplierProdWhere,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }
      let categoryWhere = {};
      if (extraParams?.category_name) {
        categoryWhere = {
          [Op.or]: [
            {
              name: extraParams.category_name,
            },
            {
              name_ar: extraParams.category_name,
            },
            {
              name_ur: extraParams.category_name,
            },
          ],
        };
      }
      let productWhere = {};
      if (extraParams?.product_name && extraParams?.status) {
        productWhere = {
          [Op.or]: [
            {
              name_en: extraParams.product_name,
            },
            {
              name_ar: extraParams.product_name,
            },
            {
              name_ur: extraParams.product_name,
            },
          ],
          status: extraParams.status,
        };
      } else if (extraParams?.product_name) {
        productWhere = {
          [Op.or]: [
            {
              name_en: extraParams.product_name,
            },
            {
              name_ar: extraParams.product_name,
            },
            {
              name_ur: extraParams.product_name,
            },
          ],
        };
      } else if (extraParams?.status) {
        productWhere = {
          status: extraParams.status,
        };
      }
      const suppProductList = await this.supplierProductsRepository.getAllData({
        where: { ...supplierProdWhere },
        include: [
          {
            model: Products,
            attributes: ['name_en', 'featured_image', 'deleted_at', 'status', 'name_ar', 'name_ur'],
            paranoid: false,
            where: { ...productWhere },
            include: [
              {
                model: Category,
                attributes: ['name', 'name_ur', 'name_ar'],
                where: {
                  ...categoryWhere,
                },
              },
            ],
          },
        ],
        limit: +limit,
        offset: (+page - 1) * +limit,
        order: order.length > 0 ? order : [['created_at', 'DESC']],
        raw: true,
        attributes: ['uuid', 'price', 'end_date'],
      });

      const finalData = [];
      const productInfo = [];
      if (suppProductList) {
        suppProductList.rows.forEach((product) => {
          productInfo.push({
            uuid: product['uuid'],
            category: product['product.category.name'],
            category_ar: product['product.category.name_ar'],
            category_ur: product['product.category.name_ur'],
            price: product['price'],
            product: product['product.name_en'],
            product_ar: product['product.name_ar'],
            product_ur: product['product.name_ur'],
            end_date: product['end_date'],
            product_image: product['product.featured_image'],
            deleted_at: product['product.deleted_at'],
            status: product['product.status'],
          });
        });
      }
      const categoryDropdown = [];
      productInfo.forEach((data) => {
        if (!categoryDropdown.find((item) => item.label === data?.category)) {
          categoryDropdown.push({
            label: language === 'en' ? data[`category`] : data[`category_${language}`],
            value: data['category'],
          });
        }
      });
      const productDropdown = [];
      productInfo.forEach((data) => {
        if (!productDropdown.find((item) => item.label === data?.product)) {
          productDropdown.push({
            label: language === 'en' ? data[`product`] : data[`product_${language}`],
            value: data['product'],
          });
        }
      });
      finalData.push({
        productInfo: productInfo,
        count: suppProductList.count,
        categoryDropdown: categoryDropdown,
        productDropdown: productDropdown,
      });
      return generalResponse(
        res,
        finalData,
        SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly supplierProductDelete = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;
      await this.supplierProductsRepository.deleteData({
        where: {
          uuid: uuid,
        },
      });
      return generalResponse(res, '', SUPPLIER_PRODUCTS_MESSAGES?.PRODUCT_DELETED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSingleSupplierProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.body;
      const getProduct = await this.supplierProductsRepository.get({
        where: {
          uuid: uuid,
        },
      });

      if (!getProduct) {
        return generalResponse(
          res,
          null,
          SUPPLIER_PRODUCTS_MESSAGES.PRODUCTS_FETCHED_FAILED,
          responseType.FAILURE,
          true,
          200,
        );
      }

      const getSingleUnit = await this.supplierProductsRepository.get({
        include: [
          {
            model: Products,
            attributes: [
              'measurement_uuid',
              'overview_en',
              'specification_en',
              'description_en',
              'status',
              'category_uuid',
              'images',
            ],
            paranoid: false,
            include: [
              {
                model: Measurement,
                attributes: ['unit_name'],
              },
            ],
          },
        ],
        raw: true,
        where: {
          uuid: uuid,
        },
      });
      let productInfo = {
        uuid: getSingleUnit['uuid'],
        category: getSingleUnit['product.category_uuid'],
        product: getSingleUnit['product_uuid'],
        price: getSingleUnit['price'],
        charges: getSingleUnit['charges'],
        end_date: getSingleUnit['end_date'],
        base_price: getSingleUnit['base_price'],
        units: getSingleUnit['units'],
        measurement: getSingleUnit['product.measurement.unit_name'],
        status: getSingleUnit['product.status'],
        overview_en: getSingleUnit['product.overview_en'],
        specification_en: getSingleUnit['product.specification_en'],
        description_en: getSingleUnit['product.description_en'],
        is_purchaseable: getSingleUnit['is_purchaseable'],
        product_images: getSingleUnit['product.images'],
      };
      return generalResponse(
        res,
        productInfo,
        SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const singleProduct = await this.productRepository.get({
        where: { uuid: productId },
        attributes: {
          exclude: [
            'created_at',
            'updated_at',
            'deleted_at',
            'uuid',
            'featured_image',
            'measurement_uuid',
            'category_uuid',
          ],
        },
        include: {
          model: Measurement,
          attributes: ['unit_name'],
        },
      });
      const singleProductInfo = singleProduct.toJSON();

      const productList = {
        ...singleProductInfo,
        measurement: singleProductInfo?.measurement?.dataValues?.unit_name,
      };
      return generalResponse(
        res,
        productList,
        SUPPLIER_PRODUCTS_MESSAGES.PRODUCT_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

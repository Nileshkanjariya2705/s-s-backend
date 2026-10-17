import { NextFunction, Request, Response } from 'express';
import { generalResponse, responseType, statusType } from '@/helper/common.helper';
import ProductsRepo from '@/repository/Products/products.repository';
import {
  CATEGORY_MESSAGES,
  MESUREMENT_MESSAGES,
  PRODUCT_MESSAGES,
  SUPPLIER_PRODUCTS_MESSAGES,
  USER_MESSAGES,
} from '@/messages/users.messages';
import CategoryRepo from '@/repository/Category/category.repository';
import db from '@/models';
import Category from '@/models/category.model';
import Measurement from '@/models/measurement.model';
import MeasurementRepo from '@/repository/Measurement/measurement.repository';
import sequelize, { Op } from 'sequelize';
import Products from '@/models/products.model';

export class ProductsController {
  constructor(
    private readonly productsRepository: ProductsRepo,
    private readonly categoryRepository: CategoryRepo,
    private readonly measurementRepository: MeasurementRepo,
  ) {}

  public readonly getAllProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiParams = req.query;
      const { page, limit, sort, isAsc, searchText, extraParams } = apiParams as any;
      const isOrderAsc = isAsc === 'true';
      let order;
      if (sort) {
        if (sort === 'name_en' || sort === 'status') {
          order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
        }
        if (sort === 'category') {
          order = [[sequelize.literal('category.name'), isOrderAsc ? 'ASC' : 'DESC']];
        }
        if (sort === 'measurement') {
          order = [[sequelize.literal('measurement.unit_name'), isOrderAsc ? 'ASC' : 'DESC']];
        }
      }

      let srch = {};

      if (searchText) {
        srch = {
          [sequelize.Op.or]: [
            {
              name_en: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              name_ar: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              name_ur: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              status: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$category.name$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$category.name_ar$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$category.name_ur$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$measurement.unit_name$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$measurement.unit_name_ar$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              '$measurement.unit_name_ur$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      let productWhere: any = {
        ...srch,
      };
      if (extraParams?.productName && extraParams?.status) {
        productWhere = {
          ...srch,
          status: extraParams.status,
          [Op.or]: [
            {
              name_en: extraParams.productName,
            },
            {
              name_ar: extraParams.productName,
            },
            {
              name_ur: extraParams.productName,
            },
          ],
        };
      } else if (extraParams?.productName) {
        productWhere = {
          ...srch,
          [Op.or]: [
            {
              name_en: extraParams.productName,
            },
            {
              name_ar: extraParams.productName,
            },
            {
              name_ur: extraParams.productName,
            },
          ],
        };
      } else if (extraParams?.status) {
        productWhere = {
          ...srch,
          status: extraParams.status,
        };
      }
      let categoryWhere;
      if (extraParams?.categoryName) {
        categoryWhere = {
          [Op.or]: [
            {
              name: extraParams.categoryName,
            },
            {
              name_ar: extraParams.categoryName,
            },
            {
              name_ur: extraParams.categoryName,
            },
          ],
        };
      }
      const getAllProducts = await this.productsRepository.getAllData({
        include: [
          {
            model: Category,
            attributes: ['name', 'name_ar', 'name_ur'],
            where: { ...categoryWhere },
          },
          {
            model: Measurement,
            attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
          },
        ],
        where: { ...productWhere },
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
        attributes: { exclude: ['deleted_at', 'updated_at'] },
      });

      return generalResponse(res, getAllProducts, PRODUCT_MESSAGES.PRODUCTS_FETCHED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid, category_uuid } = req.params;

      if (uuid) {
        const getSingleProduct = await this.productsRepository.get({
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
          where: {
            uuid: uuid,
          },
          include: [
            {
              model: Category,
              attributes: ['name'],
            },
            {
              model: Measurement,
              attributes: ['unit_name'],
            },
          ],
        });

        if (getSingleProduct) {
          let product_image = JSON.parse(getSingleProduct.dataValues.images)?.map((x) => {
            return {
              image: x,
              featured_image: '',
            };
          });

          let singleProductInfo = getSingleProduct.toJSON();

          const singleProduct = {
            ...singleProductInfo,
            product_image,
          };
          delete singleProduct.images;
          return generalResponse(res, singleProduct, PRODUCT_MESSAGES.PRODUCTS_FETCHED, 'success', false, 200);
        } else {
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_FETCHED_FAILED, 'failed', false, 200);
        }
      } else if (category_uuid) {
        const getAllProducts = await this.productsRepository.getAll({
          where: {
            category_uuid: category_uuid,
          },
          include: [
            {
              model: Category,
            },
            {
              model: Measurement,
              attributes: ['unit_name'],
            },
          ],
        });

        return generalResponse(res, getAllProducts, PRODUCT_MESSAGES.PRODUCTS_FETCHED, 'success', false, 200);
      } else {
        return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_FETCHED_FAILED, 'failed', false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly createProduct = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { featured_image, measurement_uuid, category_uuid } = req.body;
      const images = req?.[`files`]?.product_image;
      const filenames = images?.map((image) => image?.filename);
      await db.transaction(async (t) => {
        if (!featured_image && featured_image === '') {
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_ADD_FAILED, responseType.FAILURE, true, 200);
        }
        const findProduct = await this.productsRepository.get({
          where: {
            [Op.and]: [
              {
                [Op.or]: [
                  {
                    name_ar: req?.body?.name_ar,
                  },
                  {
                    name_en: req?.body?.name_en,
                  },
                  {
                    name_ur: req?.body?.name_ur,
                  },
                ],
              },
              {
                measurement_uuid: measurement_uuid,
              },
              {
                category_uuid: category_uuid,
              },
            ],
          },
        });

        if (findProduct) {
          return generalResponse(res, '', PRODUCT_MESSAGES.PRODUCTS_ALREADY_EXISTS, responseType.FAILURE, true, 200);
        }
        const createProduct = await this.productsRepository.createProduct(
          {
            data: {
              ...req.body,
              images: JSON.stringify(filenames),
              featured_image: filenames[parseInt(featured_image)],
            },
            action: 'create',
          },
          { transaction: t },
        );
        if (createProduct) {
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_ADDED, responseType.SUCCESS, true, 200);
        } else {
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_ADD_FAILED, responseType.FAILURE, true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateProduct = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { uuid, featured_image, measurement_uuid, category_uuid } = req.body;

      await db.transaction(async (t) => {
        const getProduct = await this.productsRepository.get({
          where: {
            uuid: uuid,
          },
        });

        if (getProduct) {
          const newIncommingImages = req.files.product_image;
          let newfilenames = [];
          newfilenames = newIncommingImages ? newIncommingImages.map((image) => image.filename) : [];

          let allImages = [...newfilenames];

          if (req.body.product_image) {
            typeof req.body.product_image === 'string'
              ? allImages.unshift(req.body.product_image)
              : (allImages = [...req.body.product_image, ...allImages]);
          }
          const checkProductCategory = await this.categoryRepository.checkCategoryIsAcitve(req?.body?.category_uuid, {
            transaction: t,
          });
          const checkProductMeasurement = await this.measurementRepository.checkMeasurementIsAcitve(
            req?.body?.measurement_uuid,
            {
              transaction: t,
            },
          );
          if (!checkProductCategory) {
            return generalResponse(
              res,
              null,
              PRODUCT_MESSAGES.PRODUCT_CATEGORY_INACTIVE,
              responseType.FAILURE,
              true,
              200,
            );
          }
          if (!checkProductMeasurement) {
            return generalResponse(
              res,
              null,
              PRODUCT_MESSAGES.PRODUCT_MEASUREMENT_INACTIVE,
              responseType.FAILURE,
              true,
              200,
            );
          }

          const findProduct = await Products.findOne({
            where: {
              [Op.and]: [
                {
                  [Op.or]: [
                    {
                      name_ar: req?.body?.name_ar,
                    },
                    {
                      name_en: req?.body?.name_en,
                    },
                    {
                      name_ur: req?.body?.name_ur,
                    },
                  ],
                },
                {
                  uuid: {
                    [Op.ne]: uuid,
                  },
                },
                {
                  measurement_uuid: measurement_uuid,
                },
                {
                  category_uuid: category_uuid,
                },
              ],
            },
          });

          if (findProduct) {
            return generalResponse(res, '', PRODUCT_MESSAGES.PRODUCTS_ALREADY_EXISTS, responseType.FAILURE, true, 200);
          }
          const updateProduct = await Products.update(
            {
              ...req.body,
              images: JSON.stringify(allImages),
              featured_image: allImages[parseInt(featured_image)],
            },
            { where: { uuid: uuid }, transaction: t },
          );
          if (updateProduct) {
            return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_UPDATED, responseType.SUCCESS, true, 200);
          } else {
            return generalResponse(
              res,
              null,
              PRODUCT_MESSAGES.PRODUCTS_UPDATED_FAILED,
              responseType.FAILURE,
              true,
              200,
            );
          }
        } else {
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_FETCHED_FAILED, responseType.FAILURE, true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.params;
      await db.transaction(async (t) => {
        const getProduct = await this.productsRepository.get({
          where: {
            uuid: uuid,
          },
          transaction: t,
        });
        if (getProduct) {
          const updateStatusProduct = await Products.update(
            {
              status: statusType.INACTIVE,
            },
            {
              where: {
                uuid: uuid,
              },
            },
          );
          const deleteProduct = await this.productsRepository.deleteData({
            where: {
              uuid: uuid,
            },
            transaction: t,
          });
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_DELETED, responseType.SUCCESS, true, 200);
        } else {
          return generalResponse(res, null, PRODUCT_MESSAGES.PRODUCTS_DELETED_FAILED, responseType.FAILURE, false, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllActiveCategory = async (req: Request, res: Response) => {
    try {
      await db.transaction(async (t) => {
        const { category_uuid, language } = req.query;
        let categoryName = null;
        if (category_uuid) {
          categoryName = await this.categoryRepository.get({
            where: {
              uuid: req.query.category_uuid as string,
            },
            attributes: ['name', 'uuid'],
          });
        }
        const categoryList = await this.categoryRepository.getActiveCategory(['name', 'name_ar', 'name_ur', 'uuid'], {
          transaction: t,
        });
        const categoryListInfo = [];
        if (categoryName) {
          categoryListInfo.push({
            label: categoryName['name'],
            value: categoryName['uuid'],
          });
        }
        if (categoryList) {
          categoryList.rows.forEach((data) => {
            categoryListInfo.push({
              label: language === 'en' ? data[`name`] : data[`name_${language}`],
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

  public readonly getAllActiveMeasurements = async (req: Request, res: Response) => {
    try {
      const { language } = req.query;
      await db.transaction(async (t) => {
        let measurementName = null;
        if (req.query.measurement_uuid) {
          measurementName = await this.measurementRepository.get({
            where: {
              uuid: req.query.measurement_uuid as string,
            },
            attributes: ['unit_name', 'uuid'],
          });
        }
        const measurementList = await this.measurementRepository.getActiveMeasurement(
          ['unit_name', 'uuid', 'unit_name_ar', 'unit_name_ur'],
          {
            transaction: t,
          },
        );
        const measurementListInfo = [];
        if (measurementName) {
          measurementListInfo.push({
            label: measurementName['unit_name'],
            value: measurementName['uuid'],
          });
        }
        if (measurementList) {
          switch (language) {
            case 'ar':
              measurementList.rows.forEach((data) => {
                measurementListInfo.push({
                  label: data['unit_name_ar'],
                  value: data['uuid'],
                });
              });
              break;
            case 'ur':
              measurementList.rows.forEach((data) => {
                measurementListInfo.push({
                  label: data['unit_name_ur'],
                  value: data['uuid'],
                });
              });
              break;
            default:
              measurementList.rows.forEach((data) => {
                measurementListInfo.push({
                  label: data['unit_name'],
                  value: data['uuid'],
                });
              });
              break;
          }
        }
        return generalResponse(
          res,
          measurementListInfo,
          MESUREMENT_MESSAGES.ALL_UNITS_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

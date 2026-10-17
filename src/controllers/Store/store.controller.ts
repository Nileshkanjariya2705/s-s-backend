import { generalResponse, responseType } from '@/helper/common.helper';
import { ADMIN_MESSAGES, STAFF_MESSAGES, STORE_MESSSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountUsers from '@/models/accountUsers.model';
import Address from '@/models/address.model';
import Measurement from '@/models/measurement.model';
import OrderProducts from '@/models/orderProduct.model';
import Orders from '@/models/orders.model';
import Products from '@/models/products.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';

import StoreInfo from '@/models/storesInfo.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import SupplierProducts from '@/models/supplierProducts.model';
import SupplierInfo from '@/models/supplierinfo.model';
import User from '@/models/user.model';
import AccountRepo from '@/repository/Authentication/account.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import ProductsRepo from '@/repository/Products/products.repository';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import StoreProductReviewsRepository from '@/repository/StoreProductReviews/storeProductReviews.repository';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { Op, col, fn } from 'sequelize';
export class storeInfoController {
  constructor(
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly productRepository: ProductsRepo,
    private readonly supplierProductsRepository: SupplierProductsRepo,
    private readonly purchaeReqRepository: PurchaseRequestRepo,
    private readonly accountRepository: AccountRepo,
    private readonly orderRepository: OrderRepo,
    private readonly paymentdetailRepository: PaymentDetailsRepo,
    private readonly storeProductReviewsRepository: StoreProductReviewsRepository,
  ) {}

  public readonly getSingleStoreInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.body;
      const accountUserRole = await this.accountUserRepository.getAllData({
        where: { uuid },
        include: [
          {
            model: User,
            attributes: ['email', 'username', 'image', 'phone', 'uuid'],
            include: [
              {
                model: Address,
                attributes: ['city', 'state', 'country', 'postal_code', 'phone', 'uuid', 'is_default', 'address'],
              },
            ],
          },
          {
            model: StoreInfo,
            attributes: ['company_name', 'cr_number', 'tax_number', 'address', 'uuid', 'iban_number', 'is_active'],
          },
        ],
        attributes: ['uuid', 'user_uuid'],
        raw: true,
      });

      if (accountUserRole.rows.length > 0) {
        const getStoreInfo = {
          image: accountUserRole.rows[0]?.['user.image'],
          username: accountUserRole.rows[0]?.['user.username'],
          email: accountUserRole.rows[0]?.['user.email'],
          company_name: accountUserRole.rows[0]?.['store_uuid.company_name'],
          phone: accountUserRole.rows[0]?.['user.phone'],
          cr_number: accountUserRole.rows[0]?.['store_uuid.cr_number'],
          tax_number: accountUserRole.rows[0]?.['store_uuid.tax_number'],
          iban_number: accountUserRole.rows[0]?.['store_uuid.iban_number'],
          addresses: accountUserRole.rows[0]?.['user.address'],
          is_active: accountUserRole.rows[0]?.['store_uuid.is_active'],
        };
        return generalResponse(res, getStoreInfo, ADMIN_MESSAGES?.STORE_DATA_FETCHED, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateStoreInfo = async (req: any, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { account_user_uuid, username, email, phone, cr_number, iban_number, company_name, is_active } = req.body;
        const updateAccountUserDetails = await this.accountUserRepository.get({
          where: { uuid: account_user_uuid },
          raw: true,
          transaction: t,
        });
        const findUser = await this.accountRepository.get({
          where: { uuid: updateAccountUserDetails.user_uuid },
        });
        const whereClause: {
          [Op.or]: Array<{ [key: string]: string }>;
        } = {
          [Op.or]: [{ email: email }, { username: username }],
        };
        if (phone) {
          whereClause[Op.or].push({ phone: phone });
        }
        const checkExist = await this.accountRepository.getAll({
          where: whereClause,
        });

        if (checkExist.length > 1) {
          return generalResponse(res, null, USER_MESSAGES.USER_EXIST, responseType.FAILURE, false, 200);
        }
        const checkStoreExist = await StoreInfo.findAll({
          where: {
            [Op.or]: [
              { cr_number: cr_number },
              { tax_number: req.body?.tax_number !== undefined && req.body?.tax_number },
              { iban_number: iban_number },
              { company_name: company_name },
            ],
          },
        });
        const checkSupplierExist = await SupplierInfo.findAll({
          where: {
            [Op.or]: [
              { cr_number: cr_number },
              { tax_number: req.body?.tax_number !== undefined && req.body?.tax_number },
              { iban_number: iban_number },
              { company_name: company_name },
            ],
          },
        });

        if (checkStoreExist.length > 1) {
          return generalResponse(res, null, STORE_MESSSAGES.STORE_EXISTS, responseType.FAILURE, false, 200);
        }
        if (checkSupplierExist.length) {
          return generalResponse(res, null, USER_MESSAGES.RECORD_EXIST, responseType.FAILURE, false, 200);
        }

        if (updateAccountUserDetails) {
          await User.update(
            { ...req.body, image: req.file && req.file.filename ? req.file.filename : findUser.image },
            { where: { uuid: updateAccountUserDetails.user_uuid }, transaction: t },
          );
          await StoreInfo.update(
            { ...req.body, tax_number: req.body.tax_number ? req.body.tax_number : null },
            { where: { uuid: updateAccountUserDetails.entity_uuid }, transaction: t },
          );

          const userDetail = await this.accountRepository.get({
            where: { uuid: updateAccountUserDetails.user_uuid },
          });
          const storeDetail = await StoreInfo.findOne({
            where: { uuid: updateAccountUserDetails.entity_uuid },
          });
          if (
            (userDetail.phone || phone) &&
            (storeDetail.company_name || company_name) &&
            (storeDetail.iban_number || iban_number) &&
            (storeDetail?.tax_number || (req.body?.tax_number !== undefined && req.body?.tax_number)) &&
            (storeDetail.cr_number || cr_number)
          ) {
            await StoreInfo.update(
              { is_verified: true },
              { where: { uuid: updateAccountUserDetails.entity_uuid }, transaction: t },
            );
          }
          return generalResponse(
            res,
            updateAccountUserDetails,
            ADMIN_MESSAGES.STORE_DATA_UPDATED,
            responseType.SUCCESS,
            false,
            200,
          );
        } else {
          t.rollback();
          return generalResponse(res, '', USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteStoreInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { uuid } = req.body;

        const updateAccountUserDetails = await this.accountUserRepository.get({
          where: { uuid: uuid },
          transaction: t,
        });
        if (updateAccountUserDetails) {
          await Address.destroy({ where: { user_uuid: updateAccountUserDetails.user_uuid }, transaction: t });
          await AccountUsers.destroy({ where: { user_uuid: updateAccountUserDetails.user_uuid }, transaction: t });
          await StoreInfo.destroy({ where: { uuid: updateAccountUserDetails.entity_uuid }, transaction: t });
          await User.destroy({ where: { uuid: updateAccountUserDetails.user_uuid }, transaction: t });
          return generalResponse(res, '', ADMIN_MESSAGES.STORE_DATA_DELETED, responseType.SUCCESS, false, 200);
        } else {
          t.rollback();
          return generalResponse(res, '', USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleProductDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId, productId, supplierProdId, storeId } = req.query;
      const findProduct = await this.supplierProductsRepository.get({ where: { supplier_uuid: supplierId as string } });

      if (!findProduct) {
        return generalResponse(res, null, STORE_MESSSAGES.NOT_FIND_PRODUCT, responseType.FAILURE, true, 200);
      }

      const supplierProducts = await this.supplierProductsRepository.get({
        include: {
          model: Products,
          // where: { uuid: productId },
          include: [
            {
              model: Measurement,
            },
          ],
        },

        where: {
          uuid: supplierProdId as string,
          supplier_uuid: supplierId as string,
        },
      });
      const otherSimilarProducts = await this.supplierProductsRepository.getAll({
        include: {
          model: Products,
          where: { uuid: productId },
          include: [
            {
              model: Measurement,
            },
          ],
        },

        where: {
          supplier_uuid: {
            [Op.ne]: supplierId as string,
          },
        },
      });
      const userGivenratings = await this.storeProductReviewsRepository.get({
        where: {
          store_info_uuid: storeId as string,
          product_uuid: productId as string,
          supplier_info_uuid: supplierProducts.supplier_info_uuid as string,
        },
        attributes: ['rating', 'reviews'],
      });

      const ratingOfCurrentProduct = await this.storeProductReviewsRepository.getAll({
        attributes: [[fn('AVG', col('rating')), 'averageRating'], 'product_uuid', 'supplier_info_uuid'],
        where: {
          product_uuid: productId as string,
          supplier_info_uuid: supplierProducts.supplier_info_uuid,
        },
      });

      const ratingOfOtherProduct: any = await this.storeProductReviewsRepository.getAll({
        attributes: [[fn('AVG', col('rating')), 'averageRating'], 'product_uuid', 'supplier_info_uuid'],
        where: {
          product_uuid: productId as string,
          supplier_info_uuid: { [Op.ne]: supplierProducts.supplier_info_uuid },
        },
        group: ['product_uuid', 'supplier_info_uuid'],
      });

      let finalResponse = {
        supplierProducts,
        otherSimilarProducts,
        ratings: userGivenratings,
        ratingOfCurrentProduct,
        ratingOfOtherProduct,
      };
      return generalResponse(res, finalResponse, STAFF_MESSAGES.DATA_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getPurchasedProductDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { store_uuid } = req.query;

      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      const getAllPurchaseReq = await this.supplierProductsRepository.getCount({
        where: {
          // is_purchaseable: true,
          end_date: {
            [Op.gt]: now,
          },
        },
      });
      const getInExpirePurcReq = await this.purchaeReqRepository.getCount({
        where: {
          requester_uuid: store_uuid as string,
          status: {
            [Op.in]: ['NEW', 'QUOTED'],
          },
        },
      });
      const paymentOrders = await this.paymentdetailRepository.getAll({
        where: {
          payment_status: 'SUCCESS',
        },
        attributes: ['uuid'],
        include: [
          {
            model: Orders,
            attributes: ['uuid'],
            where: {
              created_by: store_uuid as string,
            },
            include: [
              {
                model: OrderProducts,
                attributes: ['uuid'],
              },
            ],
          },
        ],
      });
      const totalOrderProductCount = paymentOrders.reduce((total, entry) => {
        return total + entry.orders.OrderProducts.length;
      }, 0);
      const purchasedProduct = await this.supplierProductsRepository.getAll({
        limit: 5,
        where: {
          end_date: {
            [Op.gt]: now,
          },
        },
        order: [['created_at', 'DESC']],
        include: [
          {
            model: Products,
          },
        ],
      });
      const finalResp = {
        getAllPurchaseReq: getAllPurchaseReq,
        getInExpirePurcReq: getInExpirePurcReq,
        totalProducts: totalOrderProductCount,
        purchasedPrdDetail: purchasedProduct,
      };
      return generalResponse(
        res,
        finalResp,
        STORE_MESSSAGES.DATA_FETCHED_SUCCESSFULLY,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import { formatDateString, generalResponse, responseType } from '@/helper/common.helper';
import { USER_MESSAGES } from '@/messages/users.messages';
import Address from '@/models/address.model';
import Category from '@/models/category.model';
import Measurement from '@/models/measurement.model';
import OrderProducts from '@/models/orderProduct.model';
import Orders from '@/models/orders.model';
import Products from '@/models/products.model';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import StoreInfo from '@/models/storesInfo.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import SupplierQuotes from '@/models/supplierQuotes.model';
import SupplierInfo from '@/models/supplierinfo.model';
import User from '@/models/user.model';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import ReviewsRepository from '@/repository/Reviews/reviews.repository';
import { Invoice } from '@axenda/zatca';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';
import {  OrderWhere, PaymentWhere,  PurchaseHistoryItem,  Supplier,  } from './types/purchaseHistory.types';

export class PurchaseHistoryController {
  constructor(
    private readonly PaymentDetailsRepository: PaymentDetailsRepo,
    private readonly OrderProductsRepository: OrderProductsRepo,
    private readonly ReviewRepository: ReviewsRepository,
  ) {}

  public readonly getAllHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_entity_uuid, apiParams, tab } = req.query;
      const { page, limit, sort, isAsc, searchText, extraParams } = apiParams as any;
      const [expiryDateFrom, expiryDateTo] = extraParams?.expiry_date || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
      let orderWhere: OrderWhere = {
        store_info_uuid: user_entity_uuid as string,
        ...(extraParams?.order_status && { status: extraParams.order_status }),
        ...(extraParams?.replacement_request && { replacement_request: true }),
        ...(extraParams?.refund_request && { refund_request: true }),
      };

      let supplierWhere = extraParams?.supplier_company ? { uuid: extraParams.supplier_company } : {};

      const isOrderAsc = isAsc === 'true';

      let search = searchText
        ? {
            [Op.or]: [
              { uuid: { [Op.like]: `%${searchText}%` } },
              { '$orders.status$': { [Op.like]: `%${searchText}%` } },
              { '$orders.purchase_request_id$': { [Op.like]: `%${searchText}%` } },
              { '$PaymentDetail.amount$': { [Op.like]: `%${searchText}%` } },
            ],
          }
        : {};

      let order;
      if (sort === 'amount') {
        order = [['amount', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'created_at') {
        order = [['created_at', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'status') {
        order = [['orders', 'status', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'company_name') {
        order = [['orders','supplierInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else {
        order = [['created_at', 'DESC']];
      }

      let paymentWhere: PaymentWhere = {
        ...search,
        payment_status: tab as string,
      };

      if (extraParams?.expiry_date) {
        paymentWhere = { ...paymentWhere, created_at: { [Op.gte]: formatedDateFrom, [Op.lte]: formatedDateTo } };
      }

      if (extraParams?.payment_uuid) {
        paymentWhere = { ...paymentWhere, uuid: { [Op.like]: `%${extraParams.payment_uuid}%` } };
      }

      const purchaseHistory = await this.PaymentDetailsRepository.getAllData({
        attributes: [
          'uuid',
          'order_id',
          'amount',
          'payment_status',
          'created_at',
          [
            Sequelize.literal(
              '(SELECT COUNT(*) FROM `order_products` WHERE `order_products`.`order_id` = `orders`.`uuid`)',
            ),
            'order_product_count',
          ],
        ],
        include: [
          {
            model: Orders,
            as: 'orders',
            where: { ...orderWhere },
            include: [
              {
                model: OrderProducts,
              },
              { model: SupplierInfo, as: 'supplierInfo', attributes: ['uuid', 'company_name'], where: supplierWhere },
            ],
          },
        ],
        subQuery: false,
        where: paymentWhere,
        order,
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
      const allSupplierSet = new Set<string>();
      purchaseHistory.rows.forEach((item: PurchaseHistoryItem) => {
        allSupplierSet.add(item.orders.supplierInfo.uuid);
      });
      const AllSupplier: Supplier[] = Array.from(allSupplierSet).map((supplierUUID: string) => {
        const supplierData = purchaseHistory.rows.find(
          (item: PurchaseHistoryItem) => item.orders.supplierInfo.uuid === supplierUUID,
        )!;
        return {
          label: supplierData.orders.supplierInfo.company_name,
          value: supplierUUID,
        };
      });

      return generalResponse(
        res,
        { purchaseHistory, AllSupplier },
        USER_MESSAGES.SUCCESS!,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_entity_uuid } = req.query;
      const orderCount = await Orders.count({
        where: {
          [Op.or]: [
            {
              status: ['Accepted'],
            },
            {
              status: ['Packaged'],
            },
            {
              status: ['In_Transit'],
            },
          ],
          store_info_uuid: user_entity_uuid as string,
        },
      });
      return generalResponse(res, orderCount, USER_MESSAGES.SUCCESS!, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSinglePurchaseRequestHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const paymentDetails: any = await this.PaymentDetailsRepository.get({
        attributes: ['uuid', 'order_id', 'payment_status', 'amount', 'created_at'],
        where: {
          uuid: req.query.payment_uuid as string,
        },
      });
      if (paymentDetails === null) {
        return generalResponse(res, null, 'no order found!', responseType.FAILURE, true, 200);
      }

      const orderDetail = await Orders.findOne({
        attributes: { exclude: ['deleted_at'] },
        where: {
          uuid: paymentDetails.dataValues.order_id as string,
        },
        include: [
          {
            model: Address,
            attributes: ['postal_code', 'city', 'address', 'state', 'country', 'entity_info_uuid', 'entity_type'],
          },
          {
            model: StoreInfo,
          },
        ],
      });

      if (paymentDetails.dataValues.payment_status === 'FAILED') {
        orderDetail.dataValues.status = 'PENDING';
      }
      const orderCreatedUserDetails = await User.findOne({
        attributes: ['username', 'email'],
        where: {
          uuid: orderDetail.created_by,
        },
      });

      const OrderProduct: any = await OrderProducts.findAndCountAll({
        where: {
          order_id: paymentDetails.dataValues.order_id,
        },
        include: [
          {
            model: SupplierProductQuotes,
            include: [
              { model: SupplierQuotes, attributes: ['charges_and_total', 'charges'] },
              {
                model: Products,
                attributes: [
                  'uuid',
                  'name_en',
                  'category_uuid',
                  'measurement_uuid',
                  'featured_image',
                  'name_ar',
                  'name_ur',
                ],
              },
              {
                model: PurchaseRequestProducts,
                attributes: { exclude: ['description', 'created_at', 'updated_at', 'deleted_at'] },

                include: [
                  {
                    model: Products,
                    paranoid: false,
                    attributes: [
                      'uuid',
                      'name_en',
                      'category_uuid',
                      'measurement_uuid',
                      'featured_image',
                      'name_ar',
                      'name_ur',
                    ],
                    include: [
                      {
                        model: Category,
                        attributes: ['name', 'uuid'],
                      },
                      {
                        model: Measurement,
                        attributes: ['unit_name'],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      });
      const ratings = await this.ReviewRepository.get({
        where: {
          supplier_info_uuid: orderDetail?.supplier_info_uuid,
          purchase_request_uuid: orderDetail.purchase_request_id as string,
        },
        attributes: ['rating', 'reviews'],
      });
      const supplierProductQuotes = OrderProduct?.rows?.[0]?.dataValues?.supplierProductQuotes;
      const vatAmount = (paymentDetails.amount * paymentDetails.dataValues?.orders?.dataValues?.vat_percentage) / 100;
      const paymentDate = moment(paymentDetails.dataValues.created_at).format('YYYY-MM-DD HH:mm');

      // THIS WILL BE MODIFIED PLEASE LOOK AFTER IT
      
      const invoice = new Invoice({
        sellerName: 'Success Creators',
        vatRegistrationNumber: '310305870400003',
        invoiceTimestamp: paymentDate,
        invoiceTotal: paymentDetails.amount.toString(),
        invoiceVatTotal: vatAmount.toString(),
      });
      invoice.toTlv();
      invoice.toBase64();
      const qrCodeBase64 = await invoice.render();
      if (supplierProductQuotes === null) {
        const findProduct = await Products.findAll({
          where: { uuid: OrderProduct?.rows?.[0]?.dataValues?.product_uuid },

          attributes: ['uuid', 'name_en', 'category_uuid', 'measurement_uuid', 'featured_image', 'name_ar', 'name_ur'],

          include: [
            {
              model: Category,
              attributes: ['name', 'uuid'],
            },
            {
              model: Measurement,
              attributes: ['unit_name'],
            },
          ],
        });

        OrderProduct.rows[0].dataValues.supplierProductQuotes = {
          ProductPurchaseRequests: { ...{ products: findProduct?.[0]?.dataValues } },
        };

        const finalResponse = {
          OrderSummary: {
            userDetail: orderCreatedUserDetails,
            paymentDetails: paymentDetails,
            orderDetail: orderDetail,
            ratings: ratings ? ratings : '',
            Qr_code: qrCodeBase64,
          },
          replacement_available: orderDetail.replacement_request ? false : true,
          refund_request: orderDetail.refund_request ? false : true,
          OrderProducts: OrderProduct,
        };

        return generalResponse(res, finalResponse, USER_MESSAGES.SUCCESS!, responseType.SUCCESS, true, 200);
      } else {
        const finalResponse = {
          OrderSummary: {
            userDetail: orderCreatedUserDetails,
            paymentDetails: paymentDetails,
            orderDetail: orderDetail,
            ratings: ratings ? ratings : '',
            Qr_code: qrCodeBase64,
          },
          replacement_available: orderDetail.replacement_request ? false : true,
          refund_request: orderDetail.refund_request ? false : true,

          OrderProducts: OrderProduct,
        };
        return generalResponse(res, finalResponse, USER_MESSAGES.SUCCESS!, responseType.SUCCESS, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
 
  
}

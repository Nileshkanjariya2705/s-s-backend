import { SERVER_URL } from '@/config';
import { LINK_TO_ENTITY_CONSTANT, ORDER_NOTIFICATION_CONTENT } from '@/constants/notification';
import { entityType, generalResponse, responseType } from '@/helper/common.helper';
import { sendMail } from '@/helper/mail.helper';
import { ORDERS_NOTIFICATIONS } from '@/messages/notificationMessages';
import { USER_MESSAGES } from '@/messages/users.messages';
import AccountUsers from '@/models/accountUsers.model';
import OrderProducts from '@/models/orderProduct.model';
import OrderProductsReplaceRequest from '@/models/orderProductsReplaceRequest.model';
import OrderReplacementRequests from '@/models/orderReplacement';
import Orders from '@/models/orders.model';
import Products from '@/models/products.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import Roles from '@/models/roles.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import User from '@/models/user.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import ReplacementRequestRepository from '@/repository/ReplacementRequest/replacementRequest.repository';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';

export class OrderReplacementController {
  constructor(
    private readonly orderRepository: OrderRepo,
    private readonly orderProductRepository: OrderProductsRepo,
    private readonly paymentDetailRepository: PaymentDetailsRepo,
    private readonly replacementRequestRepository: ReplacementRequestRepository,
    private readonly notificationRepository: NotificationRepo,
    private readonly accountUserRepository: AccountUsersRepo,
  ) {}

  public readonly createReplacementRequest = async (req: Request | any, res: Response) => {
    try {
      const { payment_uuid, values, supplier_info_uuid, requested_by } = req.body;
      const paymentDetail = await this.paymentDetailRepository.get({
        where: {
          uuid: payment_uuid,
          payment_status: 'SUCCESS',
        },
        attributes: ['order_id'],
      });
      const order_uuid = paymentDetail.order_id;
      const updateOrder = await Orders.update(
        {
          replacement_request: true,
          replacement_status: 'PENDING',
        },
        {
          where: {
            uuid: order_uuid,
          },
        },
      );
      const isOrderByNow = await this.orderRepository.get({
        where: {
          uuid: order_uuid,
        },
        include: [
          {
            model: PurchaseRequests,
            attributes: ['status'],
          },
        ],
      });
      await Promise.all(
        values.replace_product.map(async (item) => {
          const fieldInWhereClause = isOrderByNow.purchaseRequest.status === 'BUY_NOW' ? 'product_uuid' : 'quote_id';
          await OrderProducts.update(
            {
              replacement_request: true,
              replacement_reason: item.reason,
            },
            {
              where: {
                order_id: order_uuid,
                [fieldInWhereClause]: item.product,
              },
            },
          );
        }),
      );
      const getUsers = await this.accountUserRepository.getAllUserOfEntityWithoutPermissionCheck(supplier_info_uuid);
      const NotificationReciver = getUsers.map((user) => user.dataValues.user_uuid);
      await this.notificationRepository.NotificationCreateHandler({
        related_entity_id: order_uuid as string,
        related_entity_type: LINK_TO_ENTITY_CONSTANT.NEW_ORDER_REPLACEMENT,
        notification_type: ORDERS_NOTIFICATIONS,
        notification_content: ORDER_NOTIFICATION_CONTENT.SUPPLIER_ORDER_NEW_REPLACEMENT_REQUEST,
        entity_uuid: requested_by,
        entity_info_uuid: supplier_info_uuid,
        notification_reciever: NotificationReciver,
      });
      return generalResponse(res, null, 'Successfully Created Replacement Request', responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getReplacementProducts = async (req: Request, res: Response) => {
    try {
      const { payment_uuid, user_entity_uuid, apiParams } = req.query;
      const paymentDetail = await this.paymentDetailRepository.get({
        where: {
          uuid: payment_uuid as string,
          payment_status: 'SUCCESS',
        },
        attributes: ['order_id'],
      });
      if (paymentDetail) {
        const order_uuid = paymentDetail.order_id;
        const getOrderProductsWithReplacementRequest = await this.orderProductRepository.getAll({
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
          where: {
            order_id: order_uuid,
            replacement_request: true,
          },
          include: [
            {
              model: SupplierProductQuotes,
              attributes: ['other_brand_product_uuid', 'purchase_request_products_uuid'],
              include: [
                {
                  model: PurchaseRequestProducts,
                  attributes: ['product_uuid'],
                  include: [
                    {
                      model: Products,
                      attributes: ['uuid', 'name_en', 'name_ar', 'name_ur', 'featured_image'],
                    },
                  ],
                },
                {
                  model: Products,
                  paranoid: false,
                  attributes: ['uuid', 'name_en', 'featured_image', 'name_ar', 'name_ur'],
                },
              ],
            },
            {
              model: Products,
              attributes: ['uuid', 'name_en', 'name_ar', 'name_ur', 'featured_image'],
            },
          ],
        });
        const getSupplierComments = await OrderProductsReplaceRequest.findAll({
          where: {
            order_uuid: order_uuid,
          },
          include: [
            {
              model: Orders,
              attributes: ['replacement_status'],
            },
          ],
        });
        const finalResponse = {
          replacementProducts: getOrderProductsWithReplacementRequest,
          supplierResponse: getSupplierComments,
        };
        return generalResponse(
          res,
          finalResponse,
          'Successfully Fetched Replacement Request products',
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(res, null, 'Incorrect valves', responseType.FAILURE, false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly createReplacementProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { updatedStatus, orderId, OrderProducts, Address } = req.body;
      const PaymentDetails = await this.paymentDetailRepository.get({
        attributes: ['uuid'],
        include: [
          {
            model: Orders,
            where: {
              uuid: orderId as string,
                },
            attributes:["created_at","store_info_uuid","created_by"]
          },
        ],
      });
      if (PaymentDetails) {
        const createReplacementOrder = await this.replacementRequestRepository.create({
          order_id: orderId,
        });
        const order_replace_requests_uuid = createReplacementOrder.dataValues.uuid;
        const updatedProduct = updatedStatus.map((value) => ({
          ...value,
          order_product_uuid: value.uuid,
          rejection_reason: value.reason,
          replacement_product_status: value.status,
          product_uuid: value.product_uuid,
          order_uuid: orderId,
          order_replace_requests_uuid: order_replace_requests_uuid,
        }));
        await OrderProductsReplaceRequest.bulkCreate(updatedProduct);
        const status = updatedStatus.some((value) => value.status === 'ACCEPTED');
        await Orders.update(
          {
            replacement_status: status ? 'ACCEPTED' : 'REJECTED',
          },
          {
            where: {
              uuid: orderId,
            },
          },
        );

        const getUsers = await this.accountUserRepository.getAllUserOfEntityWithoutPermissionCheck(
          PaymentDetails?.orders.store_info_uuid,
        );
        const NotificationReciver = getUsers.map((user) => user.dataValues.user_uuid);
        await this.notificationRepository.NotificationCreateHandler({
          related_entity_id: PaymentDetails.uuid as string,
          related_entity_type: status
            ? LINK_TO_ENTITY_CONSTANT.ORDER_REPLACEMENT_APPROVAL
            : LINK_TO_ENTITY_CONSTANT.ORDER_REPLACEMENT_REJECT,
          notification_type: ORDERS_NOTIFICATIONS,
          notification_content: status
            ? ORDER_NOTIFICATION_CONTENT.SUPPLIER_ORDER_REPLACEMENT_APPROVAL
            : ORDER_NOTIFICATION_CONTENT.SUPPLIER_ORDER_REPLACEMENT_REJECTED,
          entity_uuid: PaymentDetails?.orders.created_by,
          entity_info_uuid: PaymentDetails?.orders.store_info_uuid,
          notification_reciever: NotificationReciver,
        });
        OrderProducts.forEach((product) => {
          const matchedProduct = updatedStatus.find((item) => item.uuid === product.uuid);
          if (matchedProduct) {
            product.status = matchedProduct.status;
            product.reason = matchedProduct.reason;
          }
        });
        const BASE_URL = `${SERVER_URL}/public/images`;
        const role = await Roles.findOne({
          where: {
            name: entityType.STORE_OWNER,
          },
        });
        const UserDetail = await AccountUsers.findOne({
          where: {
            [Op.and]: [
              {
                entity_uuid: PaymentDetails.orders.store_info_uuid,
              },
              {
                role_uuid: role.dataValues.uuid,
              },
            ],
          },
          include: {
            model: User,
            attributes: { exclude: ['uuid', 'password', 'updated_at', 'deleted_at'] },
          },
          attributes: {
            exclude: [
              'user_uuid',
              'uuid',
              'entity_type',
              'entity_uuid',
              'role_uuid',
              'created_at',
              'updated_at',
              'deleted_at',
            ],
          },
        });
        const replacement = {
          SERVER_URL,
          key: 'MemberDetail',
          mainText: 'hello',
          logoUrl: `${BASE_URL}/sitelogo.png`,
          facebookUrl: `${BASE_URL}/facebook.png`,
          instagramUrl: `${BASE_URL}/instagram.png`,
          linkdinUrl: `${BASE_URL}/linkedin.png`,
          twitterUrl: `${BASE_URL}/twitter.png`,
          orderLogo: `${BASE_URL}/Vector.png`,
          orderSummaryDetail: { OrderProducts, UserDetail,Address, orderId,order_replace_requests_uuid,orderDate:PaymentDetails.orders.created_at },
        };
        await sendMail(
          [UserDetail.user.dataValues.email],
          'Replace Order Status',
          'replaceOrderStatusSummary',
          replacement,
        );
        return generalResponse(
          res,
          null,
          'Successfully Updated Replacement Request products',
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(res, null, 'Incorrect valves', responseType.FAILURE, false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getReplacementReq = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.query;
    const response = await OrderReplacementRequests.findOne({
      where: {
        order_id: orderId as string,
      },
    });
    const data = response && response.dataValues.order_id ? true : false;
    return generalResponse(
      res,
      data,
      'Successfully Fetched Replacement Request products',
      responseType.SUCCESS,
      true,
      200,
    );
  };
}

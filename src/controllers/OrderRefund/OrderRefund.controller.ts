import { ADMIN_NOTIFICATION_UUID } from '@/config';
import {
  ADMIN_NOTIFICATION_CONTENT,
  LINK_TO_ENTITY_CONSTANT,
  ORDER_NOTIFICATION_CONTENT,
} from '@/constants/notification';
import { generalResponse, responseType } from '@/helper/common.helper';
import { ORDERS_NOTIFICATIONS } from '@/messages/notificationMessages';
import { USER_MESSAGES } from '@/messages/users.messages';
import Address from '@/models/address.model';
import OrderProducts from '@/models/orderProduct.model';
import Orders from '@/models/orders.model';
import Products from '@/models/products.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import RefundOrderProducts from '@/models/refundOrderProducts.model';
import RefundOrders from '@/models/refundOrders.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import RefundOrdersRepo from '@/repository/RefundOrders/refundOrders.repository';
import { calculateTotalRefundableAmount } from '@/utils/util';
import { Invoice } from '@axenda/zatca';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';

export class OrderRefundController {
  constructor(
    private readonly orderRepository: OrderRepo,
    private readonly orderProductRepository: OrderProductsRepo,
    private readonly orderRefundRepository: RefundOrdersRepo,
    private readonly paymentDetailRepository: PaymentDetailsRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly accountUserRepository: AccountUsersRepo,
  ) {}
  public readonly createRefundRequest = async (req: Request | any, res: Response) => {
    try {
      const { order_uuid, values, supplier_info_uuid, requested_by } = req.body;
      const updateOrder = await Orders.update(
        {
          refund_request: true,
          refund_accepted_supplier: 'PENDING',
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
        values.refund_product.map(async (item) => {
          const fieldInWhereClause = isOrderByNow.purchaseRequest.status === 'BUY_NOW' ? 'product_uuid' : 'quote_id';
          await OrderProducts.update(
            {
              refund_request: true,
              refund_reason: item.reason,
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
        related_entity_type: LINK_TO_ENTITY_CONSTANT.NEW_ORDER_REFUND,
        notification_type: ORDERS_NOTIFICATIONS,
        notification_content: ORDER_NOTIFICATION_CONTENT.SUPPLIER_ORDER_NEW_REFUND_REQUEST,
        entity_uuid: requested_by,
        entity_info_uuid: supplier_info_uuid,
        notification_reciever: NotificationReciver,
      });
      return generalResponse(res, null, 'Successfully Created Replacement Request', responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getRefundProducts = async (req: Request, res: Response) => {
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
        const getOrderProductsWithRefundRequest = await this.orderProductRepository.getAll({
          attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
          where: {
            order_id: order_uuid,
            refund_request: true,
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
        const orderDetails = await this.orderRepository.get({
          where: {
            uuid: order_uuid as string,
          },
          attributes: [
            'uuid',
            'refund_accepted_admin',
            'refund_accepted_supplier',
            'refund_request',
            'store_info_uuid',
            'supplier_info_uuid',
            'created_by',
            'address_id',
            'purchase_request_id',
            'vat_percentage',
            'created_at',
          ],

          include: [
            {
              model: Address,
              attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
            },
          ],
        });
        const getSupplierComments = await RefundOrderProducts.findAll({
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
        const RefundOrderDetail = await RefundOrders.findOne({
          attributes: { exclude: ['updated_at', 'deleted_at'] },
          where: {
            order_uuid: order_uuid,
          },
        });
        let qrCodeBase64: string = '';
        if (typeof (RefundOrderDetail?.order_amount_left)==='number') {
          const paymentDate = moment(RefundOrderDetail?.created_at).format('YYYY-MM-DD HH:mm');
          // THIS WILL BE MODIFIED PLEASE LOOK AFTER IT
          const invoice = new Invoice({
            sellerName: 'Success Creators',
            vatRegistrationNumber: '310305870400003',
            invoiceTimestamp: paymentDate,
            invoiceTotal: RefundOrderDetail?.order_amount_left.toString(),
            invoiceVatTotal: RefundOrderDetail?.order_amount_left.toString(),
          });
          invoice.toTlv();
          invoice.toBase64();
          qrCodeBase64 = await invoice.render();
        }
        const finalResponse = {
          refundProducts: getOrderProductsWithRefundRequest,
          supplierResponse: getSupplierComments,
          refundOrderDetail: RefundOrderDetail,
          orderDetails: orderDetails,
          Qr_Code: qrCodeBase64,
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

  public readonly createRefundProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { updatedStatus, orderId } = req.body;
      const PaymentDetails = await this.paymentDetailRepository.get({
        attributes: ['uuid'],
        include: [
          {
            model: Orders,
            where: {
              uuid: orderId as string,
            },
          },
        ],
      });
      if (PaymentDetails) {
        const data = updatedStatus.filter((item) => item.status === 'ACCEPTED');
        const allData = data.map(async (item) => {
          return await this.orderProductRepository.getAll({
            where: {
              uuid: item.uuid,
            },
            attributes: ['price', 'quantity'],
            raw: true,
          });
        });
        const orderProduct = (await Promise.all(allData)).flat();
        const refundable_amount_without_vat = orderProduct.reduce((total, item) => {
          const itemTotal = Number(item.price) * item.quantity;
          return itemTotal + total;
        }, 0);
        const refundable_amount: number = calculateTotalRefundableAmount(
          refundable_amount_without_vat,
          Number(PaymentDetails.orders.vat_percentage),
        );
        const createRefundOrder = await this.orderRefundRepository.create({
          order_uuid: orderId,
          refundable_amount: refundable_amount,
        });
        const refund_order_uuid = createRefundOrder.dataValues.uuid;
        const updatedProduct = updatedStatus.map((value) => ({
          order_uuid: orderId,
          refund_order_uuid: refund_order_uuid,
          order_product_uuid: value.uuid,
          product_uuid: value.product_uuid,
          reason: value.reason,
          refund_product_status: value.status,
        }));
        await RefundOrderProducts.bulkCreate(updatedProduct);
        const status = updatedStatus.some((value) => value.status === 'ACCEPTED');
        await Orders.update(
          {
            refund_accepted_supplier: status ? 'ACCEPTED' : 'REJECTED',
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
        let NotificationReciver = getUsers.map((user) => user.dataValues.user_uuid);
        await this.notificationRepository.NotificationCreateHandler({
          related_entity_id: PaymentDetails.uuid as string,
          related_entity_type: status
            ? LINK_TO_ENTITY_CONSTANT.ORDER_REFUND_APPROVAL
            : LINK_TO_ENTITY_CONSTANT.ORDER_REFUND_REJECT,
          notification_type: ORDERS_NOTIFICATIONS,
          notification_content: status
            ? ORDER_NOTIFICATION_CONTENT.SUPPLIER_ORDER_REFUND_APPROVAL
            : ORDER_NOTIFICATION_CONTENT.SUPPLIER_ORDER_REFUND_REJECTED,
          entity_uuid: PaymentDetails?.orders.created_by,
          entity_info_uuid: PaymentDetails?.orders.store_info_uuid,
          notification_reciever: NotificationReciver,
        });
        if (status === true) {
          //notification for admin to when supplier accepts the refund request
          await this.notificationRepository.NotificationCreateHandler({
            related_entity_id: orderId as string,
            related_entity_type: LINK_TO_ENTITY_CONSTANT.ORDER_REPLACEMENT_APPROVAL,
            notification_type: ORDERS_NOTIFICATIONS,
            notification_content: ADMIN_NOTIFICATION_CONTENT.ADMIN_NEW_REFUND_REQUEST,
            entity_uuid: PaymentDetails?.orders.created_by,
            entity_info_uuid: PaymentDetails?.orders.store_info_uuid,
            notification_reciever: [ADMIN_NOTIFICATION_UUID],
          });
        }
        return generalResponse(res, null, USER_MESSAGES.UPDATE, responseType.SUCCESS, false, 200);
      } else {
        return generalResponse(res, null, 'Incorrect values', responseType.FAILURE, false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getRefundRequest = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.query;
    const response = await this.orderRefundRepository.get({
      where: {
        order_uuid: orderId as string,
      },
    });
    const data = response && response.dataValues.order_uuid ? true : false;
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

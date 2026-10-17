import { generalResponse, responseType } from '@/helper/common.helper';
import { ORDER_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountUsers from '@/models/accountUsers.model';
import Chat from '@/models/chat.model';
import ChatUsers from '@/models/chatUsers.model';
import Messages from '@/models/messages.model';
import OrderProducts from '@/models/orderProduct.model';
import Orders from '@/models/orders.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import SupplierQuotes from '@/models/supplierQuotes.model';
import SupplierInfo from '@/models/supplierinfo.model';
import OrderRepo from '@/repository/Orders/order.repository';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import { NextFunction, Request, Response } from 'express';
import { Op, Sequelize, where } from 'sequelize';
import NotificationRepo from '@/repository/Notification/notification.repository';
import { LINK_TO_ENTITY, ORDERS_NOTIFICATIONS } from '@/messages/notificationMessages';
import NotificationReciever from '@/models/notificationReciever.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { AppSocket, roomUnreadCounts, usersUnreadCount } from '@/socket';
import AdminSettings from '@/models/adminSettings.model';
import User from '@/models/user.model';
import Address from '@/models/address.model';
import RefundOrders from '@/models/refundOrders.model';
import PaymentDetail from '@/models/paymentDetails.model';
import moment from 'moment';
import { generatePDFReport } from '@/utils/util';
import SupplierAdminReports from '@/models/supplierAdminReports';
import RefundOrderProducts from '@/models/refundOrderProducts.model';
import OrderReplacementRequests from '@/models/orderReplacement';
import OrderProductsReplaceRequest from '@/models/orderProductsReplaceRequest.model';
export class OrderController {
  constructor(
    private readonly orderRepository: OrderRepo,
    private readonly purchaeReqRepository: PurchaseRequestRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly notificationReceiverRepository: NotificationRecieverRepo,
  ) {}

  public readonly orderCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchase_request_uuid, created_by, supplier_id } = req.body;
      let purchase_request_id = purchase_request_uuid;
      await db.transaction(async (t) => {
        const getStoreInfo = await AccountUsers.findOne({
          where: { user_uuid: created_by },
          raw: true,
          transaction: t,
        });
        const getSupplierInfo = await SupplierInfo.findOne({ where: { uuid: supplier_id }, raw: true, transaction: t });
        const getVatCharges = await AdminSettings.findAll({
          where:{
            current_active:true
          }
        });
        const findQuotedProducts = await SupplierQuotes.findOne({
          where: {
            purchase_request_uuid: purchase_request_uuid,
            supplier_info_uuid: supplier_id,
          },
          raw: true,
        });
        const getSupplierQuotedProducts = await SupplierProductQuotes.findAll({
          where: {
            supplier_quotes_uuid: findQuotedProducts.uuid,
          },
        });
        const findOrderCount = await this.orderRepository.getAllData({
          where: {
            store_info_uuid: getStoreInfo.entity_uuid,
            created_by: created_by,
            supplier_info_uuid: supplier_id,
            purchase_request_id: purchase_request_uuid,
          },
        });
        if (findQuotedProducts && findOrderCount?.count === 0) {
          const order = await this.orderRepository.createOrderRequest(
            {
              data: {
                ...req.body,
                purchase_request_id,
                store_info_uuid: getStoreInfo.entity_uuid,
                supplier_info_uuid: getSupplierInfo.uuid,
                vat_percentage: getVatCharges[0].dataValues.vat_percentage,
                amount_without_vat: findQuotedProducts.charges_and_total,
              },
              action: 'create',
            },
            { transaction: t },
          );
          const getQuotedProducts = await SupplierProductQuotes.findAll({
            where: {
              supplier_quotes_uuid: findQuotedProducts.uuid,
              offered_price: { [Op.ne]: null },
            },
          });
          let orderedProducts = [];
          getQuotedProducts.map((item, index) => {
            orderedProducts.push({
              order_id: order.dataValues.uuid,
              quote_id: getSupplierQuotedProducts[index].uuid,
              price: item.offered_price,
              quantity: item.offered_quantity,
            });
          });
          await OrderProducts.bulkCreate(orderedProducts, { transaction: t });
          return generalResponse(res, null, ORDER_MESSAGES.ORDER_CREATED, responseType.SUCCESS, true, 200);
        } else {
          //when user not attempting payment and in between vat charges changed then update
          const orderData = await this.orderRepository.get({
            where: {
              purchase_request_id: purchase_request_uuid,
              uuid: findOrderCount.rows[0].dataValues.uuid,
              supplier_info_uuid: supplier_id,
            },
          });
          await this.orderRepository.updateOrder({
            data: {
              vat_percentage: getVatCharges[0].dataValues.vat_percentage,
            },
            action: 'update',
            orderData,
          });
          return generalResponse(res, null, ORDER_MESSAGES.ORDER_ADDED, responseType.SUCCESS, true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly orderUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId, address_id, supplier_info_uuid } = req.body;
      const findAddress = await Address.findOne({
        where: {
          uuid: address_id,
        },
      });
      let branch_uuid = findAddress.branch_uuid;
      const orderData = await this.orderRepository.get({
        where: { purchase_request_id: purchaseReqId, supplier_info_uuid: supplier_info_uuid },
      });
      await this.orderRepository.updateOrder({
        data: {
          ...req.body,
          branch_uuid:branch_uuid
        },
        action: 'update',
        orderData,
      });
      return generalResponse(res, null, ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getVatCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findCharges = await this.orderRepository.get({
        where: {
          uuid: req.query.orderId as string,
        },
      });

      return generalResponse(res, findCharges, USER_MESSAGES.VATCHARGES_GET, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAddress = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const address = await this.orderRepository.get({
        where: {
          uuid: req.query.orderId as string,
        },
        include: [
          {
            model: Address,
            attributes: ['address', 'city', 'state', 'country', 'postal_code'],
          },
        ],
        attributes: ['uuid'],
      });
      return generalResponse(res, address, USER_MESSAGES.ADDRESS_FETCHED, 'succerss', false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAllOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_uuid, searchText } = req.query;
      let srch = {};
      if (searchText) {
        srch = {
          [Op.or]: [
            {
              uuid: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }

      const getLoggedInUserInfo = await AccountUsers.findOne({
        where: { user_uuid: req.query.user_uuid as string },
        raw: true,
      });

      let whereCondition: {
        store_info_uuid?: string;
        supplier_info_uuid?: string;
        status: {
          [Op.notIn]: string[];
        };
      } = {
        status: { [Op.notIn]: ['PENDING'] },
      };

      if (getLoggedInUserInfo.entity_type === 'STORE') {
        whereCondition.store_info_uuid = getLoggedInUserInfo.entity_uuid;
      } else {
        whereCondition.supplier_info_uuid = getLoggedInUserInfo.entity_uuid;
      }

      const lastSeenTimestamps = await ChatUsers.findAll({
        where: { user_uuid: user_uuid as string },
        attributes: ['last_seen', 'chat_uuid'],
      });

      const getOrders = await this.orderRepository.getAll({
        where: { ...whereCondition, ...srch },
        attributes: ['created_at', 'uuid', 'status', 'supplier_info_uuid', 'store_info_uuid'],
        include: [
          {
            model: Chat,
            attributes: ['order_uuid', 'uuid'],
            include: [
              {
                model: Messages,
                attributes: ['created_at', 'message'],
                where: {
                  user_uuid: { [Op.ne]: user_uuid as string },
                },
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],
      });

      const lastSeenObj = {};

      lastSeenTimestamps.forEach((lastSeen) => {
        lastSeenObj[lastSeen.dataValues.chat_uuid] = lastSeen.dataValues.last_seen;
      });

      getOrders.forEach((order) => {
        if (order?.chat) {
          const lastSeenTimestamp = lastSeenObj[order?.chat?.dataValues?.uuid];
          if (lastSeenTimestamp) {
            order.chat.dataValues.message = order.chat.dataValues.message.filter(
              (message) => message.dataValues.created_at > lastSeenTimestamp,
            );
          }
        }

        roomUnreadCounts[order.uuid] = order?.chat?.dataValues?.message?.length
          ? order?.chat?.dataValues?.message?.length
          : 0;
      });
      delete roomUnreadCounts['null'];
      usersUnreadCount[user_uuid as string] = {
        ...roomUnreadCounts,
      };
      AppSocket()
        .to(user_uuid as string)
        .emit('unreadCount', usersUnreadCount);
      AppSocket().emit('chat_opened', () => {});

      return generalResponse(res, getOrders, ORDER_MESSAGES.ORDER_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { status, store_info_uuid } = req.body;
      const result = await db.transaction(async (t) => {
        const update = await Orders.update(
          { status: status },
          {
            where: {
              uuid: orderId,
            },
            transaction: t,
          },
        );
        const paymentId = await PaymentDetail.findOne({
          where: {
            order_id: orderId,
            payment_status: 'SUCCESS',
          },
        });
        const orderDetail = await Orders.findOne({
          where: {
            uuid: orderId,
          },
          transaction: t,
          raw: true,
        });

        const userDetail = await User.findOne({
          where: {
            uuid: orderDetail.created_by,
          },
          attributes: ['email'],
        });

        if (status === 'DELIVERED') {
          const updateChatStatus = await Chat.update(
            { status: 'CLOSED' },
            { where: { order_uuid: orderId }, transaction: t },
          );
        }
        const Notification = await this.notificationRepository.createNotification(
          {
            data: {
              related_entity_type: 'ORDERS',
              related_entity_id: orderId,
              content_en: ORDERS_NOTIFICATIONS.STORE_ORDER_STATUS_CHANGE_EN(orderId, status),
              content_ar: ORDERS_NOTIFICATIONS.STORE_ORDER_STATUS_CHANGE_AR(orderId, status),
              content_ur: ORDERS_NOTIFICATIONS.STORE_ORDER_STATUS_CHANGE_UR(orderId, status),
              link_to_entity: LINK_TO_ENTITY.ORDERS(paymentId?.dataValues?.uuid),
            },
            action: 'create',
          },
          { transaction: t },
        );
        const getUsers = await this.accountUserRepository.getAllUserOfEntityWithoutPermissionCheck(store_info_uuid);
        const dataToCreate = [];
        const recieverIds = [];
        getUsers &&
          Array.isArray(getUsers) &&
          getUsers.length > 0 &&
          getUsers.map((data) => {
            dataToCreate.push({
              notification_uuid: Notification.dataValues.uuid,
              receiver_uuid: data.user_uuid,
            });
            recieverIds.push(data.user_uuid);
          });
        await NotificationReciever.bulkCreate(dataToCreate, { transaction: t });
        await this.notificationReceiverRepository.Notificationbroadcaster(dataToCreate, recieverIds, t);

        return generalResponse(res, null, ORDER_MESSAGES.ORDER_FETCHED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateReplaceStatus = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId } = req.params;
    const { replacement_status, store_info_uuid } = req.body;
    try {
      await db.transaction(async (t) => {
        await Orders.update(
          { replacement_status: replacement_status },
          {
            where: {
              uuid: orderId,
            },
            transaction: t,
          },
        );
      });
      return generalResponse(res, '', ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly addCancelReason = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.params;
      const { reason } = req.body;
      const result = await db.transaction(async (t) => {
        const update = await Orders.update(
          { status: 'CANCELLED', reason_for_cancel: reason },
          {
            where: {
              uuid: orderId,
            },
            transaction: t,
          },
        );
        return generalResponse(res, '', ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly adminRefundOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.body;
      const RefundOrder = await RefundOrders.findOne({
        where: {
          order_uuid: orderId,
        },
      });
      if (!RefundOrder) {
        return generalResponse(res, null, 'Invalid Input values', responseType.FAILURE, true, 200);
      }
      const PaymentDetails = await PaymentDetail.findOne({
        attributes: ['amount'],
        where: {
          order_id: orderId,
          payment_status: 'SUCCESS',
        },
      });
      await Orders.update(
        {
          refund_accepted_admin: true,
        },
        {
          where: {
            uuid: orderId,
          },
        },
      );
      //updateting INVOICE for store
      //paid amount - refunded amount
      await RefundOrders.update(
        {
          order_amount_left: Number(PaymentDetails.amount - RefundOrder.refundable_amount),
        },
        {
          where: {
            order_uuid: orderId,
          },
        },
      );
      return generalResponse(res, null, ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  // Admin
  public readonly supplierSalesSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const supplierWiseDetails = await this.orderRepository.getOrderSupplierWise(req.body);
      return generalResponse(res, supplierWiseDetails, ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly generateStatistic = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getAllSuppliers = await SupplierInfo.findAll({
        attributes: ['uuid'],
      });
      const currentMonth = moment().month();
      const currentYear = moment().year();
      const currentDay = moment().day();
      const getAllOrders = await SupplierInfo.findAndCountAll({
        include: [
          {
            model: Orders,
            where: {
              supplier_info_uuid: {
                [Op.in]: getAllSuppliers.map((supplier) => supplier.uuid),
              },
              status: {
                [Op.notIn]: ['PENDING'],
              },
              [Op.and]: Sequelize.literal(
                `YEAR(Orders.created_at) = ${currentYear} AND MONTH(Orders.created_at) = ${currentMonth}`,
              ),
            },
            include: [
              {
                model: PaymentDetail,
                attributes: { exclude: ['updated_at', 'deleted_at'] },
              },
              {
                model: Address,
                attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
              },
              {
                model: OrderProducts,
                attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
              },
              {
                model: RefundOrders,
                attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },

                include: [
                  {
                    model: RefundOrderProducts,
                    attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
                  },
                ],
              },
              {
                model: OrderReplacementRequests,
                attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },

                include: [
                  {
                    model: OrderProductsReplaceRequest,
                    attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
                  },
                ],
              },
            ],
          },
        ],
      });
      return generalResponse(res, getAllOrders, ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import { NextFunction, Request, Response, response } from 'express';

import { entityType, formatDateString, generalResponse, paymentStatus, responseType } from '@/helper/common.helper';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import Orders from '@/models/orders.model';
import User from '@/models/user.model';
import { Op, Sequelize } from 'sequelize';
import moment from 'moment';
import axios from 'axios';
import db from '@/models';
import { FRONT_URL, TAP_AUTHORIZATION, TAP_URL } from '@config';
import OrderRepo from '@/repository/Orders/order.repository';
import { PaymentCharge, SAVE_CARD_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import ChatRepo from '@/repository/Chat/chat.repository';
import ChatUserRepo from '@/repository/ChatUser/chatUser.repository';
import AccountUsers from '@/models/accountUsers.model';
import Roles from '@/models/roles.model';
import StoreInfo from '@/models/storesInfo.model';
import Address from '@/models/address.model';
import OrderProducts from '@/models/orderProduct.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import SupplierQuotes from '@/models/supplierQuotes.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import Products from '@/models/products.model';
import SupplierInfo from '@/models/supplierinfo.model';
import { LINK_TO_ENTITY, ORDERS_NOTIFICATIONS, PAYMENT_NOTIFICATIONS } from '@/messages/notificationMessages';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import PaymentDetail from '@/models/paymentDetails.model';
import { SERVER_URL, ADMIN_EMAIL } from '@/config';
import { sendMail } from '@/helper/mail.helper';
import ReviewsRepository from '@/repository/Reviews/reviews.repository';
import Measurement from '@/models/measurement.model';
import SaveCard from '@/models/saveCard.model';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
const sequelize = require('sequelize');
import { Invoice } from '@axenda/zatca';
import {
  LINK_TO_ENTITY_CONSTANT,
  ORDER_NOTIFICATION_CONTENT,
  PAYMENT_NOTIFICATION_CONTENT,
} from '@/constants/notification';
import SaveCardRepo from '@/repository/SaveCard/saveCard.repository';
import OrderReplacementRequests from '@/models/orderReplacement';
import RefundOrders from '@/models/refundOrders.model';
import RefundOrderProducts from '@/models/refundOrderProducts.model';
import OrderProductsReplaceRequest from '@/models/orderProductsReplaceRequest.model';
import { monthData_ar, monthData_en, monthData_ur } from '@/constants/status';
export class PaymentDetailsController {
  constructor(
    private readonly paymentdetailRepo: PaymentDetailsRepo,
    private readonly orderRepository: OrderRepo,
    private readonly orderProductRepository: OrderProductsRepo,
    private readonly chatRepository: ChatRepo,
    private readonly chatUserRepository: ChatUserRepo,
    private readonly supplierQuotesRepository: SupplierQuotesRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationReceiverRepository: NotificationRecieverRepo,
    private readonly ReviewRepository: ReviewsRepository,
    private readonly saveCardRepository: SaveCardRepo,
  ) {}

  public readonly transactionDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiParams = req.query;

      const { page, limit } = apiParams as any;

      let transactionDetails = await this.paymentdetailRepo.getAllData({
        include: {
          model: Orders,
          attributes: ['uuid'],
          include: [
            { model: User, attributes: ['username', 'image'] },
            {
              model: StoreInfo,
              attributes: ['company_name'],
            },
          ],
        },
        where: {
          payment_status: 'SUCCESS',
        },
        attributes: { exclude: ['updated_at', 'created_at', 'charge_id', 'payment_status'] },
        limit: +limit,
        offset: (+page - 1) * +limit,
      });

      return generalResponse(res, transactionDetails, USER_MESSAGES.TRANSACTION_FETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly weeklyTopSeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const oneWeekAgo = moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss');
      const now = moment().format('YYYY-MM-DD HH:mm:ss');
      let transactionDetails: any = await this.paymentdetailRepo.getAll({
        include: {
          model: Orders,
          attributes: ['uuid'],
          include: [
            {
              model: StoreInfo,
              attributes: {
                exclude: ['created_at', 'updated_at'],
              },
            },
            { model: User, attributes: ['username', 'image'] },
          ],
        },
        where: {
          payment_status: 'SUCCESS',
          created_at: {
            [Op.lt]: now,
            [Op.gt]: oneWeekAgo,
          },
        },
      });

      const usernameCounts: { username: string; count: number }[] = [];
      let totalAmount = 0;
      transactionDetails.forEach((transaction: any, index: number) => {
        const username = transaction?.dataValues?.orders?.dataValues?.storeInfo.dataValues.company_name;
        const amount = transaction?.dataValues?.amount;
        const existingUser = usernameCounts.find((item) => item.username === username);
        if (existingUser) {
          existingUser.count++;
        } else {
          usernameCounts.push({ username, count: 1 });
        }
        if (amount) {
          totalAmount += amount;
        }
      });

      return generalResponse(
        res,
        { usernameCounts, totalAmount },
        USER_MESSAGES.WEEKLY_GRAPH_DETAIL,
        'success',
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly categoryReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let categoryDetails: any = await this.paymentdetailRepo.getAll({
        include: {
          model: Orders,

          attributes: ['uuid'],
          required: true,
          include: [
            {
              model: OrderProducts,
              where: {
                entity_type: 'existing_purchase_request_products',
              },
            },
          ],
        },
        where: {
          payment_status: 'SUCCESS',
        },
      });

      return generalResponse(res, categoryDetails, USER_MESSAGES.CATEGORY_GRAPH_DETAIL, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly createCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, order, req_id, supplierId, token_id, store_info_uuid, supplierProdId } = req.body;
      const findCard = await this.saveCardRepository.get({
        where: { store_info_uuid: store_info_uuid },
      });

      let { customer_id } = findCard?.dataValues;
      if (customer_id) {
        let encodedId1, encodedId2, encodedId3, mergeId;
        if (supplierProdId) {
          encodedId1 = Buffer.from(req_id).toString('base64');
          encodedId2 = Buffer.from(supplierId).toString('base64');
          encodedId3 = Buffer.from(supplierProdId).toString('base64');
          mergeId = `${encodedId1}|${encodedId2}|${encodedId3}`;
        } else {
          encodedId1 = Buffer.from(req_id).toString('base64');
          encodedId2 = Buffer.from(supplierId).toString('base64');

          mergeId = `${encodedId1}|${encodedId2}`;
        }
        const apiUrl = `${TAP_URL}/charges`;

        const data = {
          amount: amount,
          currency: 'SAR',
          customer_initiated: true,
          threeDSecure: true,
          save_card: false,
          reference: { transaction: order, order: order },
          receipt: { email: true, sms: true },
          customer: {
            id: customer_id,
          },
          source: { id: token_id ? token_id : 'src_all' },

          post: { url: `${FRONT_URL}/checkout-process/${mergeId}` },
          redirect: { url: `${FRONT_URL}/checkout-process/${mergeId}` },
        };

        const requestHeaders = {
          Authorization: TAP_AUTHORIZATION,
          accept: 'application/json',
          'content-type': 'application/json',
        };
        const response = await axios.post(apiUrl, data, { headers: requestHeaders });

        if (response?.data?.status === 'INITIATED') {
          const result = await db.transaction(async (t) => {
            const createPayment = await this.paymentdetailRepo.createRequest(
              {
                data: {
                  order_id: order,
                  payment_status: 'PENDING',
                  amount: amount,
                  charge_id: response?.data?.id,
                },
                action: 'create',
              },
              { transaction: t },
            );
          });

          return generalResponse(
            res,
            response.data?.transaction?.url,
            PaymentCharge.PaymentChargeCREATED,
            'success',
            true,
            200,
          );
        } else {
          return generalResponse(res, null, PaymentCharge.Payment_FAILED, 'failed', true, 200);
        }
      } else {
        return generalResponse(res, null, PaymentCharge.Payment_FAILED, 'failed', true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  // public readonly getCharge = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { tapId, purchaseReqId, supplier_info_uuid, do_not_save } = req?.query as {
  //       tapId: string;
  //       purchaseReqId: string;
  //       supplier_info_uuid: string;
  //       do_not_save: string | undefined;
  //     };
  //     if (purchaseReqId && tapId) {
  //       const getOrderId = await this.orderRepository.get({
  //         where: { purchase_request_id: purchaseReqId, supplier_info_uuid: supplier_info_uuid },
  //       });
  //       const paymentDetail = await this.paymentdetailRepo.get({
  //         where: { order_id: getOrderId?.dataValues?.uuid, charge_id: tapId },
  //       } as {});

  //       if (paymentDetail) {
  //         const chatEntry = await this.chatRepository.get({ where: { order_uuid: getOrderId?.dataValues?.uuid } });
  //         const getSupplierQuote = await this.supplierQuotesRepository.get({
  //           where: {
  //             supplier_info_uuid: getOrderId?.dataValues?.supplier_info_uuid as string,
  //             purchase_request_uuid: purchaseReqId as string,
  //           },
  //           attributes: ['uuid'],
  //         });

  //         await Orders.update(
  //           {
  //             payment_mode: 'CARD',
  //           },
  //           {
  //             where: {
  //               purchase_request_id: purchaseReqId,
  //               uuid: getOrderId?.dataValues?.uuid,
  //             },
  //           },
  //         );

  //         const chargeId = tapId;

  //         const headers = {
  //           Authorization: TAP_AUTHORIZATION,
  //           accept: 'application/json',
  //         };

  //         const response: any = await axios.get(`${TAP_URL}/charges/${chargeId}`, { headers });

  //         if (response?.data?.status === 'CAPTURED') {
  //           await SupplierQuotes.update(
  //             {
  //               is_paid: true,
  //               payment_method: 'CARD',
  //             },
  //             {
  //               where: {
  //                 supplier_info_uuid: getOrderId?.dataValues?.supplier_info_uuid as string,
  //                 purchase_request_uuid: purchaseReqId as string,
  //               },
  //             },
  //           );
  //         }

  //         if (!chatEntry && response?.data?.status === 'CAPTURED') {
  //           const buyNowReq = await PurchaseRequests.findOne({
  //             where: {
  //               uuid: purchaseReqId,
  //               supplier_info_uuid: { [Op.not]: null },
  //               status: { [Op.eq]: 'BUY_NOW' },
  //             },
  //           });
  //           if (!buyNowReq) {
  //             await SupplierProductQuotes.update(
  //               {
  //                 is_approved: true,
  //               },
  //               {
  //                 where: {
  //                   supplier_quotes_uuid: getSupplierQuote.dataValues.uuid,
  //                 },
  //               },
  //             );
  //           }

  //           const accountUserRole = await AccountUsers.findOne({
  //             include: [
  //               {
  //                 model: Roles,
  //                 attributes: ['name'],
  //                 where: { name: entityType.SUPPLIER_OWNER },
  //               },
  //             ],
  //             where: { entity_uuid: getOrderId?.dataValues?.supplier_info_uuid },
  //           });

  //           const result = await db.transaction(async (t) => {
  //             const chat = await this.chatRepository.create(
  //               {
  //                 order_uuid: getOrderId?.dataValues?.uuid,
  //                 supplier_info_uuid: getOrderId?.dataValues?.supplier_info_uuid,
  //                 store_info_uuid: getOrderId?.dataValues?.store_info_uuid,
  //                 status: 'OPEN',
  //               },
  //               { transaction: t },
  //             );

  //             const userId = [getOrderId?.dataValues?.created_by, accountUserRole?.user_uuid];

  //             const chatUserEntry = userId.map((user: any) => {
  //               return {
  //                 user_uuid: user,
  //                 chat_uuid: chat?.dataValues?.uuid,
  //               };
  //             });
  //             await this.chatUserRepository.bulkCreate(chatUserEntry, { transaction: t });
  //           });
  //         }

  //         await this.paymentdetailRepo.updatePaymentDetail({
  //           data: {
  //             payment_status: response?.data?.status === 'CAPTURED' ? 'SUCCESS' : 'FAILED',
  //             payment_method_type: response?.data?.card?.scheme,
  //           },
  //           action: 'update',
  //           paymentDetail,
  //         });

  //         let getUsername;
  //         if (response?.data?.status === 'CAPTURED') {
  //           const result = await db.transaction(async (t) => {
  //             const orderData = await this.orderRepository.get({
  //               where: { purchase_request_id: purchaseReqId, supplier_info_uuid: supplier_info_uuid },
  //               transaction: t,
  //             });

  //             await this.orderRepository.updateOrder({
  //               data: {
  //                 status: 'ACCEPTED',
  //               },
  //               action: 'update',
  //               orderData,
  //             });
  //             await PurchaseRequests.update(
  //               {
  //                 status: 'COMPLETED',
  //               },
  //               {
  //                 where: {
  //                   uuid: purchaseReqId,
  //                   supplier_info_uuid: { [Op.not]: null },
  //                   status: { [Op.ne]: 'BUY_NOW' },
  //                 },
  //                 transaction: t,
  //               },
  //             );

  //             getUsername = await this.accountUserRepository.get({
  //               where: { entity_uuid: getOrderId?.dataValues?.store_info_uuid },
  //               include: [
  //                 { model: User, attributes: ['username', 'email'] },
  //                 { model: StoreInfo, attributes: ['company_name'] },
  //               ],
  //             });

  //             // supplier has new order notification
  //             await this.notificationRepository.NotificationCreateHandler({
  //               related_entity_id: getOrderId?.dataValues?.uuid,
  //               related_entity_type: LINK_TO_ENTITY_CONSTANT.ORDER,
  //               notification_type: ORDERS_NOTIFICATIONS,
  //               notification_content: ORDER_NOTIFICATION_CONTENT.SUPPLIER_NEW_ORDER,
  //               entity_uuid: getUsername.store_uuid.dataValues.company_name,
  //               permission_name: 'View Orders',
  //               permission_owner: 'SUPPLIER',
  //               entity_info_uuid: supplier_info_uuid,
  //             });
  //           });
  //         }
  //         const getUserAddress = await this.orderRepository.get({
  //           where: {
  //             uuid: getOrderId?.dataValues?.uuid,
  //           },
  //           attributes: ['uuid'],
  //           include: [
  //             {
  //               model: Address,
  //               attributes: ['address', 'city', 'state', 'country', 'postal_code'],
  //             },
  //           ],
  //         });
  //         const ratings = await this.ReviewRepository.get({
  //           where: {
  //             supplier_info_uuid: supplier_info_uuid,
  //             purchase_request_uuid: purchaseReqId as string,
  //           },
  //           attributes: ['rating', 'reviews'],
  //         });

  //         let findCard: any = {};

  //         if (response?.data?.save_card && response?.data?.card?.id) {
  //           findCard = await this.saveCardRepository.get({
  //             where: { customer_id: response.data?.customer?.id, card_id: response?.data?.card?.id },
  //           });
  //         }

  //         let finalResponse = {
  //           email: response?.data?.customer?.email,
  //           order_date: response?.data?.transaction?.created,
  //           amount: response?.data?.transaction?.amount,
  //           name: response?.data?.customer?.first_name,
  //           payment_status: response?.data?.status === 'CAPTURED' ? 'Success' : 'Failed',
  //           address: getUserAddress,
  //           ratings: ratings,
  //           order_uuid: getOrderId?.dataValues?.uuid,
  //           save_card: findCard ? false : response.data.save_card,
  //           card_name: findCard ? findCard?.dataValues?.card_name : null,
  //           customer_id: response?.data?.customer?.id,
  //           card_id: response?.data?.card?.id,
  //         };

  //         const findPurchaseReq = await PurchaseRequests.findOne({
  //           where: { uuid: purchaseReqId as string, status: 'BUY_NOW' },
  //         });

  //         return generalResponse(res, finalResponse, PaymentCharge.PaymentChargeUPDATED, 'success', true, 200);
  //       } else {
  //         return generalResponse(res, null, PaymentCharge.PAYMENT_DETAILS_NOT_FIND, 'success', true, 200);
  //       }
  //     } else {
  //       return generalResponse(res, null, PaymentCharge.PAYMENT_DETAILS_NOT_FIND, 'success', true, 200);
  //     }
  //   } catch (error) {
  //     return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
  //   }
  // };

  public readonly getCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // get all the data from the checkout page
      const { tapId, purchaseReqId, supplier_info_uuid } = req?.query as {
        tapId: string;
        purchaseReqId: string;
        supplier_info_uuid: string;
        do_not_save: string | undefined;
      };

      if (purchaseReqId && tapId) {
        // GRAB ORDER DETAILS
        const orderDetails = await this.orderRepository.get({
          where: { purchase_request_id: purchaseReqId, supplier_info_uuid: supplier_info_uuid },
        });
        // GRAB PAYMENT DETAILS
        const paymentDetail = await this.paymentdetailRepo.get({
          where: { order_id: orderDetails?.dataValues?.uuid, charge_id: tapId },
        });
        // GRAB THAT QUOTE FOR WHICH PAYMENT IS INITIALIZED
        const getSupplierQuote = await this.supplierQuotesRepository.get({
          where: {
            supplier_info_uuid: orderDetails?.dataValues?.supplier_info_uuid as string,
            purchase_request_uuid: purchaseReqId as string,
          },
          attributes: ['uuid'],
        });
        // GRAB USER'S ADDRESS FOR ORDER DILIVERY
        const getUserAddress = await this.orderRepository.get({
          where: {
            uuid: orderDetails?.dataValues?.uuid,
          },
          attributes: ['uuid'],
          include: [
            {
              model: Address,
              attributes: ['address', 'city', 'state', 'country', 'postal_code'],
            },
          ],
        });
        // GET USER'S RATING ON ORDER
        const ratings = await this.ReviewRepository.get({
          where: {
            supplier_info_uuid: supplier_info_uuid,
            purchase_request_uuid: purchaseReqId as string,
          },
          attributes: ['rating', 'reviews'],
        });

        // THIS MEANS THAT THE PAYEMENT FOR THIS ORDER IS COMPLETED
        if (paymentDetail.payment_status === 'SUCCESS' && orderDetails.status === 'ACCEPTED') {
          const finalResponse = {
            email: paymentDetail.payer_email,
            order_date: paymentDetail.order_payment_timestamp,
            amount: paymentDetail.confirm_amount_payed,
            name: paymentDetail.payer_name,
            payment_status: paymentDetail.payment_status,
            address: getUserAddress,
            ratings: ratings,
            order_uuid: orderDetails?.dataValues?.uuid,
            save_card: paymentDetail.payed_by_save_card,
            customer_id: paymentDetail.customer_id,
            card_id: paymentDetail.card_id,
          };
          return generalResponse(res, finalResponse, PaymentCharge.PaymentChargeUPDATED, 'success', true, 200);
        } else {
          // PAYMENT IS NOT DONE YET FOR THIS ORDER PROCEDURE AFTER REDIRECTION FROM PAYMENT
          const chargeId = tapId;
          const headers = {
            Authorization: TAP_AUTHORIZATION,
            accept: 'application/json',
          };
          console.log("🚀 ~ PaymentDetailsController ~ readonlygetCharge= ~ chargeId:", chargeId)
          // HERE WE WILL TO GET THE CHARGE DETAILS ON CONFIRMATION TAB AFTER THE REDIRECTED FROM PAYMENT COMPLITION
          const response: any = await axios.get(`${TAP_URL}/charges/${chargeId}`, { headers });

          console.log("🚀 ~ PaymentDetailsController ~ readonlygetCharge= ~ response:", response)
          // AFTER PAYMENT IS SUCCESSFUL CHAT SHOULD BE INITAINED (check chat existance)
          const chatEntry = await this.chatRepository.get({ where: { order_uuid: orderDetails?.dataValues?.uuid } });

          // UPDATE PAYMENT AFTER SUCCESSFUL REDIRECTION TO OUR DOMAIN
          await this.paymentdetailRepo.updatePaymentDetail({
            data: {
              payment_status: response?.data?.status === 'CAPTURED' ? 'SUCCESS' : 'FAILED',
              payment_method_type: response?.data?.card?.scheme,
              payer_email: response?.data?.customer?.email,
              payer_name: response?.data?.customer?.first_name,
              order_payment_timestamp: response?.data?.transaction?.created,
              customer_id: response?.data?.customer?.id,
              payed_by_save_card: response?.data?.save_card,
              tap_order_id: response?.data?.order?.id,
              confirm_amount_payed: response?.data?.transaction?.amount,
              card_id: response?.data?.card?.id,
              tap_payment_response: response.data,
            },
            action: 'update',
            paymentDetail,
          });

          if (response?.data?.status === 'CAPTURED') {
            const result = await db.transaction(async (t) => {
              // UPDATE THE SUPPLIER QUOTES TO PAID
              await SupplierQuotes.update(
                {
                  is_paid: true,
                  payment_method: 'CARD',
                },
                {
                  where: {
                    supplier_info_uuid: orderDetails?.dataValues?.supplier_info_uuid as string,
                    purchase_request_uuid: purchaseReqId as string,
                  },
                  transaction: t,
                },
              );

              // HERE CHANGE ORDER PAYMENT MODE & STATUS TO ACCEPTED (IF PAYMENT IS SUCCESSFUL)
              await Orders.update(
                {
                  payment_mode: 'CARD',
                  status: 'ACCEPTED',
                },
                {
                  where: {
                    purchase_request_id: purchaseReqId,
                    uuid: orderDetails?.dataValues?.uuid,
                  },
                  transaction: t,
                },
              );

              // FIND WHERE TO PURCHASE REQUEST IS DIRED BUY
              const buyNowReq = await PurchaseRequests.findOne({
                where: {
                  uuid: purchaseReqId,
                  supplier_info_uuid: { [Op.not]: null },
                  status: { [Op.eq]: 'BUY_NOW' },
                },
                transaction: t,
              });
              if (!buyNowReq) {
                /* IF OUR PURCHASE REQUEST IS NOT DIRECT BY THEN IT MUST BE PURCHASE REQUEST !
                  SO WE NEED TO UPDATE THE SUPPLIER PRODUCTS THAT THIS PRODUCTS ARE PURCHASED
               */
                await SupplierProductQuotes.update(
                  {
                    is_approved: true,
                  },
                  {
                    where: {
                      supplier_quotes_uuid: getSupplierQuote.dataValues.uuid,
                    },
                    transaction: t,
                  },
                );
              }
              // FETCH ACCOUNT ROLES TO MAKE CHAT WITH ALL STORE, SUPPLIER OWNER & THEIR MEMBERS
              const accountUserRole = await AccountUsers.findOne({
                include: [
                  {
                    model: Roles,
                    attributes: ['name'],
                    where: { name: entityType.SUPPLIER_OWNER },
                  },
                ],
                where: { entity_uuid: orderDetails?.dataValues?.supplier_info_uuid },
                transaction: t,
              });
              // CREATE AN ENTRY FOR CHAT FOR ALL USERS
              if (!chatEntry) {
                const chat = await this.chatRepository.create(
                  {
                    order_uuid: orderDetails?.dataValues?.uuid,
                    supplier_info_uuid: orderDetails?.dataValues?.supplier_info_uuid,
                    store_info_uuid: orderDetails?.dataValues?.store_info_uuid,
                    status: 'OPEN',
                  },
                  { transaction: t },
                );
                const userId = [orderDetails?.dataValues?.created_by, accountUserRole?.user_uuid];
                const chatUserEntry = userId.map((user: any) => {
                  return {
                    user_uuid: user,
                    chat_uuid: chat?.dataValues?.uuid,
                  };
                });
                await this.chatUserRepository.bulkCreate(chatUserEntry, { transaction: t });
              }
              await PurchaseRequests.update(
                {
                  status: 'COMPLETED',
                },
                {
                  where: {
                    uuid: purchaseReqId,
                    supplier_info_uuid: { [Op.not]: null },
                    status: { [Op.ne]: 'BUY_NOW' },
                  },
                  transaction: t,
                },
              );

              const getUsername = await this.accountUserRepository.get({
                where: { entity_uuid: orderDetails?.dataValues?.store_info_uuid },
                include: [
                  { model: User, attributes: ['username', 'email'] },
                  { model: StoreInfo, attributes: ['company_name'] },
                ],
                transaction: t,
              });

              // supplier has new order notification
              await this.notificationRepository.NotificationCreateHandler({
                related_entity_id: orderDetails?.dataValues?.uuid,
                related_entity_type: LINK_TO_ENTITY_CONSTANT.ORDER,
                notification_type: ORDERS_NOTIFICATIONS,
                notification_content: ORDER_NOTIFICATION_CONTENT.SUPPLIER_NEW_ORDER,
                entity_uuid: getUsername.store_uuid.dataValues.company_name,
                permission_name: 'View Orders',
                permission_owner: 'SUPPLIER',
                entity_info_uuid: supplier_info_uuid,
              });
            });
          }
          // TO FIND SAVED CARED USED FOR THE ORDER
          let findCard: any = {};
          if (response?.data?.save_card && response?.data?.card?.id) {
            findCard = await this.saveCardRepository.get({
              where: { customer_id: response.data?.customer?.id, card_id: response?.data?.card?.id },
            });
          }
          const finalResponse = {
            email: response?.data?.customer?.email,
            order_date: response?.data?.transaction?.created,
            amount: response?.data?.transaction?.amount,
            name: response?.data?.customer?.first_name,
            payment_status: response?.data?.status === 'CAPTURED' ? 'SUCCESS' : 'FAILED',
            address: getUserAddress,
            ratings: ratings,
            order_uuid: orderDetails?.dataValues?.uuid,
            save_card: findCard ? false : response.data.save_card,
            card_name: findCard ? findCard?.dataValues?.card_name : null,
            customer_id: response?.data?.customer?.id,
            card_id: response?.data?.card?.id,
          };
          return generalResponse(res, finalResponse, PaymentCharge.PaymentChargeUPDATED, 'success', true, 200);
        }
      } else {
        return generalResponse(res, null, PaymentCharge.PAYMENT_DETAILS_NOT_FIND, 'success', true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly sendConfirmationMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { order_uuid } = req.query;

      const mailsent = await this.orderRepository.get({
        where: { uuid: order_uuid as string, is_mail_sent: true, status: 'ACCEPTED' },
      });
      if (!mailsent) {
        const PaymentDetail = await this.paymentdetailRepo.get({
          where: {
            order_id: order_uuid as string,
          },
          attributes: ['payment_status', 'amount', 'uuid'],
          include: {
            model: Orders,
            include: [
              {
                model: StoreInfo,
                attributes: ['company_name', 'uuid'],
              },
              {
                model: Address,
                attributes: { exclude: ['uuid', 'user_uuid', 'is_default', 'created_at', 'updated_at', 'deleted_at'] },
              },
              {
                model: OrderProducts,
                attributes: ['price', 'quantity'],
                include: [
                  {
                    model: SupplierProductQuotes,
                    attributes: ['purchase_request_products_uuid', 'other_brand_product_uuid'],
                    include: [
                      { model: SupplierQuotes, attributes: ['charges_and_total', 'payment_method'] },
                      { model: Products, attributes: ['name_en', 'name_ur', 'name_ar'] },
                      {
                        model: PurchaseRequestProducts,
                        attributes: ['product_uuid'],
                        include: [
                          {
                            model: Products,
                            attributes: ['name_en', 'featured_image'],
                            include: [
                              {
                                model: Measurement,
                                attributes: ['unit_short_name'],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Products,
                    attributes: ['name_en', 'featured_image'],
                    include: [
                      {
                        model: Measurement,
                        attributes: ['unit_short_name'],
                      },
                    ],
                  },
                ],
              },
            ],
            attributes: ['additional_info', 'status', 'created_at', 'uuid', 'vat_percentage'],
          },
        });

        const role = await Roles.findOne({
          where: {
            name: entityType.STORE_OWNER,
          },
        });
        const UserDetail = await AccountUsers.findOne({
          where: {
            [Op.and]: [
              {
                entity_uuid: PaymentDetail.orders.storeInfo.uuid,
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
        let orderLogo = '';
        const BASE_URL = `${SERVER_URL}/public/images`;

        if (PaymentDetail.orders.status === 'ACCEPTED') {
          orderLogo = `${BASE_URL}/Vector.png`;
        } else if (PaymentDetail.orders.status === 'PACKAGED') {
          orderLogo = `${BASE_URL}/Vector.png`;
        } else if (PaymentDetail.orders.status === 'IN_TRANSIT') {
          orderLogo = `${BASE_URL}/intransit.png`;
        } else if (PaymentDetail.orders.status === 'DELIVERED') {
          orderLogo = `${BASE_URL}/delivered.png`;
        } else if (PaymentDetail.orders.status === 'PENDING') {
          orderLogo = `${BASE_URL}/pending.png`;
        }

        const replacement = {
          SERVER_URL,
          key: 'MemberDetail',
          mainText: 'hello',
          logoUrl: `${BASE_URL}/sitelogo.png`,
          facebookUrl: `${BASE_URL}/facebook.png`,
          instagramUrl: `${BASE_URL}/instagram.png`,
          linkdinUrl: `${BASE_URL}/linkedin.png`,
          twitterUrl: `${BASE_URL}/twitter.png`,
          orderLogo: `${orderLogo}`,
          orderSummaryDetail: { PaymentDetail, UserDetail },
        };

        await sendMail([UserDetail.user.dataValues.email], 'Order Status', 'orderSummary', replacement);
        await Orders.update(
          {
            is_mail_sent: true,
          } as any,
          {
            where: {
              uuid: order_uuid,
              status: {
                [Op.ne]: 'PENDING',
              },
            },
          } as any,
        );
        return generalResponse(res, null, USER_MESSAGES.MAIL_SEND, 'success', false, 200);
      } else {
        return generalResponse(res, null, USER_MESSAGES.MAIL_SEND, 'success', false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly sendReplacementStatusMail = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { order_uuid } = req.query;

      const PaymentDetail = await this.paymentdetailRepo.get({
        where: {
          order_id: order_uuid as string,
        },
        attributes: ['payment_status', 'amount', 'uuid'],
        include: {
          model: Orders,
          include: [
            {
              model: StoreInfo,
              attributes: ['company_name', 'uuid'],
            },
            {
              model: Address,
              attributes: { exclude: ['uuid', 'user_uuid', 'is_default', 'created_at', 'updated_at', 'deleted_at'] },
            },
            {
              model: OrderProductsReplaceRequest,
              where: {
                replacement_product_status: 'ACCEPTED',
              },
              include: [
                {
                  model: OrderProducts,
                  attributes: ['price', 'quantity'],
                },
                {
                  model: Products,
                  attributes: ['name_en', 'featured_image'],
                  include: [
                    {
                      model: Measurement,
                      attributes: ['unit_short_name'],
                    },
                  ],
                },
              ],
            },
          ],
        },
      });

      const role = await Roles.findOne({
        where: {
          name: entityType.STORE_OWNER,
        },
      });
      const UserDetail = await AccountUsers.findOne({
        where: {
          [Op.and]: [
            {
              entity_uuid: PaymentDetail.orders.storeInfo.uuid,
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
      let orderLogo = '';
      const BASE_URL = `${SERVER_URL}/public/images`;

      if (PaymentDetail.orders.replacement_status === 'ACCEPTED') {
        orderLogo = `${BASE_URL}/Vector.png`;
      } else if (PaymentDetail.orders.replacement_status === 'PACKAGED') {
        orderLogo = `${BASE_URL}/Vector.png`;
      } else if (PaymentDetail.orders.replacement_status === 'IN_TRANSIT') {
        orderLogo = `${BASE_URL}/intransit.png`;
      } else if (PaymentDetail.orders.replacement_status === 'DELIVERED') {
        orderLogo = `${BASE_URL}/delivered.png`;
      } else if (PaymentDetail.orders.replacement_status === 'PENDING') {
        orderLogo = `${BASE_URL}/pending.png`;
      }

      const replacement = {
        SERVER_URL,
        key: 'MemberDetail',
        mainText: 'hello',
        logoUrl: `${BASE_URL}/sitelogo.png`,
        facebookUrl: `${BASE_URL}/facebook.png`,
        instagramUrl: `${BASE_URL}/instagram.png`,
        linkdinUrl: `${BASE_URL}/linkedin.png`,
        twitterUrl: `${BASE_URL}/twitter.png`,
        orderLogo: `${orderLogo}`,
        orderSummaryDetail: { PaymentDetail, UserDetail },
      };

      await sendMail([UserDetail.user.dataValues.email], 'Order Status', 'replaceOrderSummary', replacement);
      return generalResponse(res, null, USER_MESSAGES.MAIL_SEND, 'success', false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly checkStatusByOrderId = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId, orderId, tapId } = req?.query as { purchaseReqId: string; orderId: string; tapId: string };
      const chargeId = tapId;

      const headers = {
        Authorization: TAP_AUTHORIZATION,
        accept: 'application/json',
      };

      if (purchaseReqId) {
        const getOrderId = await this.orderRepository.get({
          where: { purchase_request_id: purchaseReqId, uuid: orderId },
        });

        const paymentDetail = await this.paymentdetailRepo.get({
          where: { order_id: getOrderId?.dataValues?.uuid },
          order: [['created_at', 'DESC']],
          attributes: {
            exclude: [
              'tap_payment_response',
              'confirm_amount_payed',
              'card_id',
              'tap_order_id',
              'payed_by_save_card',
              'customer_id',
              'order_payment_timestamp',
              'payer_name',
              'payer_email',
            ],
          },
        });
        let finalFinal = {};
        if (paymentDetail?.payment_status === 'SUCCESS') {
          finalFinal = { payment_mode: 'CARD', payment_message: 'Payment Successful', ...paymentDetail.dataValues };
          return generalResponse(res, finalFinal, PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
        } else {
          // IF PAYMENT IS FAIELD OR NOT DONE YET THEN PERFORM THIS
          if (tapId) {
            //If i get tapID evalutes payment was failed first time or verifing initially after payment is redirected to our domain
            const response = await axios.get(`${TAP_URL}/charges/${chargeId}`, { headers });
            const statusMessage = paymentStatus(response?.data?.response?.code as string);
            finalFinal = {
              payment_mode: 'CARD',
              payment_message: statusMessage,
              ...paymentDetail.dataValues,
              payment_status: response?.data?.response?.code === '000' ? 'SUCCESS' : 'PENDING',
            };
            return generalResponse(res, finalFinal, PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
          } else {
            // IF PAYMENT IS DONE THROUGH BANK TANSKER
            if (getOrderId?.dataValues?.payment_mode === 'BANK_TRANSFER') {
              finalFinal = { payment_mode: 'BANK_TRANSFER', ...paymentDetail.dataValues };
              return generalResponse(res, finalFinal, PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
            }
            // payment is not yet done
            finalFinal = { ...paymentDetail?.dataValues };
            return generalResponse(res, finalFinal, PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
          }
        }
      } else {
        return generalResponse(res, null, PaymentCharge.PAYMENT_DETAILS_NOT_FIND, 'success', true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly getDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId, apiParams } = req.query;
      if (!supplierId || supplierId === 'undefined') {
        return generalResponse(res, { orderDetail: { count: 0, rows: [] }, allStores: [], orderCount: 0 }, USER_MESSAGES.SUCCESS, 'success', true, 200);
      }

      const { page, limit, sort, searchText, isAsc, extraParams } = apiParams as any;
      let order;

      const isOrderAsc = isAsc === 'true';
      let srch = {};
      if (searchText) {
        srch = {
          [Op.or]: [
            {
              '$storeInfo.company_name$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              '$PaymentDetail.amount$': {
                [Op.like]: `%${searchText}%`,
              },
              '$PaymentDetail.payment_status$': 'SUCCESS',
            },
            {
              status: {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              uuid: {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              purchase_request_id: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      if (sort === 'amount') {
        order = [['PaymentDetail', 'amount', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'company_name') {
        order = [['storeInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'status') {
        order = [['status', isOrderAsc ? 'ASC' : 'DESC']];
      }
      let orderWhere: any = {
        supplier_info_uuid: supplierId,
        status: {
          [Op.ne]: 'PENDING',
        },
        ...srch,
      };
      if (extraParams?.replacement_request) {
        orderWhere = { ...orderWhere, replacement_request: true };
      }
      if (extraParams?.refund_request) {
        orderWhere = { ...orderWhere, refund_request: true };
      }
      if (extraParams?.order_id) {
        orderWhere = {
          supplier_info_uuid: supplierId,
          status: {
            [Op.ne]: 'PENDING',
          },
          ...srch,
          uuid: {
            [Op.like]: `%${extraParams?.order_id}%`,
          },
        };
      }
      if (extraParams?.order_status) {
        orderWhere = {
          supplier_info_uuid: supplierId,
          status: extraParams?.order_status,
          ...srch,
        };
      }
      if (extraParams?.order_id && extraParams?.order_status) {
        orderWhere = {
          supplier_info_uuid: supplierId,
          status: extraParams.order_status,
          ...srch,
          uuid: {
            [Op.like]: `%${extraParams?.order_id}%`,
          },
        };
      }
      let storeWhere = {};
      if (extraParams?.store_company) {
        storeWhere = {
          uuid: extraParams?.store_company,
        };
      }
      let paymentWhere: any = {
        payment_status: 'SUCCESS',
      };
      if (extraParams?.amount && extraParams?.order_date) {
        const [expiryDateFrom, expiryDateTo] = extraParams?.order_date || [];
        const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
        const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
        paymentWhere = {
          ...paymentWhere,
          amount: extraParams?.amount,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }
      if (extraParams?.amount) {
        paymentWhere = {
          payment_status: 'SUCCESS',
          amount: extraParams?.amount,
        };
      }
      if (extraParams?.order_date) {
        const [expiryDateFrom, expiryDateTo] = extraParams?.order_date || [];
        const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
        const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
        paymentWhere = {
          ...paymentWhere,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }
      const orderDetail = await Orders.findAndCountAll({
        distinct: true,
        attributes: ['uuid', 'status', 'purchase_request_id', 'replacement_status', 'refund_accepted_supplier'],
        where: {
          ...orderWhere,
        } as any,
        include: [
          {
            model: StoreInfo,
            attributes: ['uuid', 'company_name'],
            as: 'storeInfo',
            where: { ...storeWhere },
          },
          {
            model: PaymentDetail,
            attributes: ['amount', 'order_id', 'payment_status', 'created_at'],
            as: 'PaymentDetail',
            where: { ...paymentWhere },
          } as any,
        ],
        subQuery: false,
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });

      const allStores = [];
      orderDetail.rows.map((item: any) => {
        const res = allStores.some((obj) => obj.value === item.dataValues.storeInfo.dataValues.uuid);
        if (res === false) {
          allStores.push({
            label: item.dataValues.storeInfo.dataValues.company_name,
            value: item.dataValues.storeInfo.dataValues.uuid,
          });
        }
      });
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
          supplier_info_uuid: supplierId as string,
        },
      });
      return generalResponse(res, { orderDetail, allStores, orderCount }, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly recentOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId, apiParams } = req.query;

      const { page, limit, sort, searchText, isAsc } = apiParams as any;
      let order;
      const isOrderAsc = isAsc === 'true';
      let srch = {};
      if (searchText) {
        srch = {
          [sequelize.Op.or]: [
            {
              '$orders.storeInfo.company_name$': {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              amount: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      if (sort === 'amount') {
        order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
      } else {
        order = [[Sequelize.literal('"Orders.StoreInfo.company_name"'), isOrderAsc ? 'ASC' : 'DESC']];
      }
      const orderDetail = await PaymentDetail.findAndCountAll({
        attributes: ['order_id', 'amount', 'payment_status'],
        where: { payment_status: 'SUCCESS', ...srch },
        include: {
          model: Orders,
          where: {
            supplier_info_uuid: supplierId,
            status: {
              [Op.ne]: 'PENDING',
            },
          },
          attributes: ['store_info_uuid', 'status'],
          include: [
            {
              model: StoreInfo,
              attributes: ['company_name'],
            },
          ],
        },

        order: order,
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
      return generalResponse(res, orderDetail, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly getSingleOrderDetail = async (req: Request, res: Response, next: NextFunction) => {
    const { orderId, requestType } = req.query;
    try {
      const OrderDetails = await this.orderRepository.get({
        where: {
          uuid: orderId as string,
        },
      });
      if (OrderDetails) {
        const PaymentDetail: any = await this.paymentdetailRepo.get({
          where: {
            order_id: orderId as string,
          },
          attributes: ['payment_status', 'amount', 'uuid', 'created_at'],
          include: {
            model: Orders,
            include: [
              {
                model: StoreInfo,
                attributes: ['company_name', 'uuid'],
              },
              {
                model: Address,
                attributes: { exclude: ['uuid', 'user_uuid', 'is_default', 'created_at', 'updated_at', 'deleted_at'] },
              },
              {
                model: OrderProducts,
                attributes: [
                  'uuid',
                  'price',
                  'quantity',
                  'replacement_reason',
                  'replacement_request',
                  'refund_request',
                  'refund_reason',
                ],
                include: [
                  {
                    model: SupplierProductQuotes,
                    attributes: ['purchase_request_products_uuid', 'other_brand_product_uuid'],
                    include: [
                      { model: SupplierQuotes, attributes: ['charges_and_total', 'charges'] },

                      {
                        model: PurchaseRequestProducts,
                        attributes: ['product_uuid'],
                        include: [
                          {
                            model: Products,
                            attributes: ['name_en', 'featured_image', 'name_ar', 'name_ur', 'uuid'],
                            include: [
                              {
                                model: Measurement,
                                attributes: ['unit_short_name', 'unit_short_name_ur', 'unit_short_name_ar'],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        model: Products,
                        attributes: ['name_en', 'featured_image', 'name_ar', 'name_ur', 'uuid'],
                        include: [
                          {
                            model: Measurement,
                            attributes: ['unit_short_name', 'unit_short_name_ur', 'unit_short_name_ar'],
                          },
                        ],
                      },
                    ],
                  },
                  {
                    model: Products,
                    attributes: ['name_en', 'featured_image', 'name_ar', 'name_ur', 'uuid'],
                    include: [
                      {
                        model: Measurement,
                        attributes: ['unit_short_name', 'unit_short_name_ur', 'unit_short_name_ar'],
                      },
                    ],
                  },
                ],
              },
            ],
            attributes: [
              'additional_info',
              'status',
              'created_at',
              'uuid',
              'vat_percentage',
              'payment_mode',
              'reason_for_cancel',
              'replacement_status',
              'refund_request',
              'refund_accepted_supplier',
              'refund_accepted_admin',
            ],
          },
        });

        const StoreOrder = await this.orderRepository.get({
          where: {
            uuid: orderId as string,
          },
          attributes: ['store_info_uuid'],
        });

        const role = await Roles.findOne({
          where: {
            name: entityType.STORE_OWNER,
          },
        });

        const UserDetail = await AccountUsers.findOne({
          where: {
            entity_uuid: StoreOrder.store_info_uuid,
            role_uuid: role.dataValues.uuid,
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

        const vatAmount = (PaymentDetail.amount * PaymentDetail.dataValues?.orders?.dataValues?.vat_percentage) / 100;
        const paymentDate = moment(PaymentDetail.dataValues.created_at).format('YYYY-MM-DD HH:mm');

        const invoice = new Invoice({
          sellerName: 'Success Creators',
          vatRegistrationNumber: '310305870400003',
          invoiceTimestamp: paymentDate,
          invoiceTotal: PaymentDetail.amount.toString(),
          invoiceVatTotal: vatAmount.toString(),
        });
        invoice.toTlv();
        invoice.toBase64();
        const qrCodeBase64 = await invoice.render();
        let RefundOrderData;
        if (requestType === 'replace_request') {
          RefundOrderData = await OrderProductsReplaceRequest.findAll({
            where: {
              order_uuid: orderId as string,
            },
            attributes: ['replacement_product_status', 'rejection_reason', 'order_product_uuid'],
          });
        }
        const finalResult = { PaymentDetail, UserDetail, RefundOrderData, Qr_code: qrCodeBase64 };
        return generalResponse(res, finalResult, USER_MESSAGES.SUCCESS, 'success', true, 200);
      } else {
        return generalResponse(res, null, 'Incorrect valves', responseType.FAILURE, false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly adminOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { searchText, limit, page, isAsc, sort, extraParams } = apiParams as any;
      const [expiryDateFrom, expiryDateTo] = extraParams?.order_date || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
      let order;
      const isOrderAsc = isAsc === 'true';
      let srch = {};
      if (
        searchText ||
        extraParams?.store_company ||
        extraParams?.supplier_company ||
        extraParams?.amount ||
        extraParams?.status ||
        extraParams?.order_uuid
      ) {
        srch = {
          [Op.or]: [
            {
              '$storeInfo.company_name$': {
                [Op.like]: `%${searchText || extraParams?.store_company}%`,
              },
            },
            {
              '$supplierInfo.company_name$': {
                [Op.like]: `%${searchText || extraParams?.supplier_company}%`,
              },
            },
            {
              '$PaymentDetail.amount$': {
                [Op.like]: `%${searchText || extraParams?.amount}%`,
              },
            },
            {
              status: {
                [Op.like]: `%${searchText || extraParams?.status}%`,
              },
            },
            {
              uuid: {
                [Op.like]: `%${searchText || extraParams?.order_uuid}%`,
              },
            },
          ],
        };
      }
      if (sort === 'amount') {
        order = [['PaymentDetail', 'amount', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'store') {
        order = [['storeInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'supplier') {
        order = [['supplierInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'status') {
        order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
      }
      let paymentWhere: any = { payment_status: 'SUCCESS' };
      let orderWhere;
      orderWhere = { ...srch };
      if (extraParams?.refund_order) {
        orderWhere = { ...srch, refund_accepted_supplier: 'ACCEPTED' };
      }
      if (extraParams?.order_date) {
        paymentWhere = {
          ...paymentWhere,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }
      const orderDetail = await Orders.findAndCountAll({
        attributes: ['uuid', 'status', 'refund_accepted_admin', 'refund_accepted_supplier'],
        where: {
          ...orderWhere,
        } as any,
        include: [
          { model: RefundOrders, attributes: ['refundable_amount'] },

          {
            model: StoreInfo,
            attributes: ['company_name'],
            as: 'storeInfo',
          },
          {
            model: SupplierInfo,
            attributes: ['company_name'],
            as: 'supplierInfo',
          },
          {
            model: PaymentDetail,
            attributes: ['amount', 'created_at', 'payment_status', 'payment_method_type'],
            as: 'PaymentDetail',
            where: { ...paymentWhere },
            // required: true,
          } as any,
        ],
        subQuery: false,
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
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
        },
      });
      return generalResponse(res, { orderDetail, orderCount }, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly singleadminRefundOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.query;

      const checkOrder = await this.orderRepository.get({ where: { uuid: orderId as string } });

      if (checkOrder !== null) {
        const singleOrder = await this.paymentdetailRepo.get({
          attributes: ['payment_status', 'amount', 'uuid'],
          where: {
            order_id: orderId as string,
          },
          include: [
            {
              model: Orders,
              attributes: [
                'uuid',
                'status',
                'created_at',
                'payment_receipt',
                'purchase_request_id',
                'payment_mode',
                'refund_accepted_admin',
              ],
              include: [
                {
                  model: Address,
                  attributes: {
                    exclude: ['uuid', 'user_uuid', 'created_at', 'updated_at', 'deleted_at', 'is_default', 'phone'],
                  },
                },
                {
                  model: StoreInfo,
                  attributes: ['uuid', 'company_name', 'cr_number', 'tax_number'],
                },
                {
                  model: SupplierInfo,
                  attributes: ['uuid', 'company_name', 'cr_number', 'tax_number'],
                },
                {
                  model: RefundOrders,
                  attributes: ['uuid', 'refundable_amount'],
                  include: [
                    {
                      model: RefundOrderProducts,
                      where: {
                        refund_product_status: 'ACCEPTED',
                      },
                      attributes: ['refund_order_uuid', 'order_product_uuid', 'product_uuid'],
                      include: [
                        { model: OrderProducts, attributes: ['price', 'quantity', 'uuid'] },
                        {
                          model: Products,
                          attributes: ['name_en', 'featured_image', 'name_ar', 'name_ur'],
                          include: [
                            {
                              model: Measurement,
                              attributes: ['unit_short_name', 'unit_short_name_ur', 'unit_short_name_ar'],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });

        const storeOwner = await AccountUsers.findOne({
          where: {
            entity_uuid: singleOrder.orders.storeInfo.uuid,
          },
          include: {
            model: User,
            attributes: ['username'],
          },
          attributes: {
            exclude: [
              'uuid',
              'entity_type',
              'entity_uuid',
              'user_uuid',
              'role_uuid',
              'created_at',
              'updated_at',
              'deleted_at',
            ],
          },
        });
        const supplierOwner = await AccountUsers.findOne({
          where: {
            entity_uuid: singleOrder.orders.supplierInfo.uuid,
          },
          include: {
            model: User,
            attributes: ['username'],
          },
          attributes: {
            exclude: [
              'uuid',
              'entity_type',
              'entity_uuid',
              'user_uuid',
              'role_uuid',
              'created_at',
              'updated_at',
              'deleted_at',
            ],
          },
        });
        const ownerData = {
          storeOwnerName: storeOwner.user.username,
          supplierOwnerName: supplierOwner.user.username,
        };
        return generalResponse(
          res,
          { singleData: singleOrder, ownerData: ownerData },
          USER_MESSAGES.SUCCESS,
          'success',
          true,
          200,
        );
      } else {
        return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly singleadminOrderDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId } = req.query;

      const checkOrder = await this.orderRepository.get({ where: { uuid: orderId as string } });

      if (checkOrder !== null) {
        const singleOrder = await this.paymentdetailRepo.get({
          attributes: ['payment_status', 'amount', 'uuid'],
          where: {
            order_id: orderId as string,
          },
          include: [
            {
              model: Orders,
              attributes: [
                'uuid',
                'status',
                'created_at',
                'payment_receipt',
                'purchase_request_id',
                'payment_mode',
                'vat_percentage',
              ],
              include: [
                {
                  model: Address,
                  attributes: {
                    exclude: ['uuid', 'user_uuid', 'created_at', 'updated_at', 'deleted_at', 'is_default', 'phone'],
                  },
                },
                {
                  model: StoreInfo,
                  attributes: ['uuid', 'company_name', 'cr_number', 'tax_number'],
                },
                {
                  model: SupplierInfo,
                  attributes: ['uuid', 'company_name', 'cr_number', 'tax_number'],
                },
                {
                  model: OrderProducts,
                  attributes: ['price', 'quantity'],
                  include: [
                    {
                      model: SupplierProductQuotes,
                      attributes: ['purchase_request_products_uuid', 'other_brand_product_uuid'],
                      include: [
                        {
                          model: PurchaseRequestProducts,
                          attributes: ['product_uuid'],
                          include: [
                            {
                              model: Products,
                              attributes: ['name_en', 'featured_image', 'name_ar', 'name_ur'],
                              include: [
                                {
                                  model: Measurement,
                                  attributes: ['unit_short_name', 'unit_short_name_ur', 'unit_short_name_ar'],
                                },
                              ],
                            },
                          ],
                        },
                        {
                          model: SupplierQuotes,
                          attributes: ['charges_and_total', 'charges'],
                        },
                      ],
                    },
                    {
                      model: Products,
                      attributes: ['name_en', 'featured_image', 'name_ar', 'name_ur'],
                      include: [
                        {
                          model: Measurement,
                          attributes: ['unit_short_name', 'unit_short_name_ur', 'unit_short_name_ar'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });

        const storeOwner = await AccountUsers.findOne({
          where: {
            entity_uuid: singleOrder.orders.storeInfo.uuid,
          },
          include: {
            model: User,
            attributes: ['username'],
          },
          attributes: {
            exclude: [
              'uuid',
              'entity_type',
              'entity_uuid',
              'user_uuid',
              'role_uuid',
              'created_at',
              'updated_at',
              'deleted_at',
            ],
          },
        });
        const supplierOwner = await AccountUsers.findOne({
          where: {
            entity_uuid: singleOrder.orders.supplierInfo.uuid,
          },
          include: {
            model: User,
            attributes: ['username'],
          },
          attributes: {
            exclude: [
              'uuid',
              'entity_type',
              'entity_uuid',
              'user_uuid',
              'role_uuid',
              'created_at',
              'updated_at',
              'deleted_at',
            ],
          },
        });
        const ownerData = {
          storeOwnerName: storeOwner.user.username,
          supplierOwnerName: supplierOwner.user.username,
        };
        return generalResponse(
          res,
          { singleData: singleOrder, ownerData: ownerData },
          USER_MESSAGES.SUCCESS,
          'success',
          true,
          200,
        );
      } else {
        return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly getMonthlySell = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { from, to, lang }: { from?: string; to?: string; lang?: string } = req.query;
      const monthlyData = await this.paymentdetailRepo.getAll({
        attributes: [
          [Sequelize.literal("CONCAT(MONTH(created_at), '-', YEAR(created_at))"), 'month-year'],
          [Sequelize.fn('SUM', Sequelize.col('amount')), 'total_amount'],
        ],
        where: {
          created_at: {
            [Op.between]: [from, to],
          },
        },
        group: ['month-year'],
        raw: true,
      });
      const sd = new Date(from);
      const ed = new Date(to);
      let data = [];
      while (sd <= ed) {
        let month;
        const monthIndex = sd.getMonth() + 1;
        if (lang === 'en') {
          month = monthData_en[monthIndex];
        } else if (lang === 'ar') {
          month = monthData_ar[monthIndex];
        } else {
          month = monthData_ur[monthIndex];
        }
        const year = sd.getFullYear();
        const ans = monthlyData.find((item) => item['month-year'] === `${monthIndex}-${year}`);
        if (ans) {
          data.push({ month: `${month}-${year}`, total_amount: ans['total_amount'] });
        } else {
          data.push({ month: `${month}-${year}`, total_amount: 0 });
        }
        sd.setMonth(sd.getMonth() + 1);
      }
      return generalResponse(res, data, PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly retriveAllCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiUrl = `${TAP_URL}/charges/list`;
      const requestData = {
        period: {
          date: {
            from: '1662190768000',
            to: '1662536368000',
          },
          type: '1',
        },
        limit: '20',
      };

      const requestHeaders = {
        Authorization: TAP_AUTHORIZATION,
        accept: 'application/json',
        'content-type': 'application/json',
      };

      const response = await axios.post(apiUrl, requestData, { headers: requestHeaders });
      const completedPaymentArray =
        Array.isArray(response?.data?.charges) &&
        response?.data?.charges.length > 0 &&
        response?.data?.charges.filter((item) => {
          if (item?.response?.message === 'Captured' && item?.source.payment_method !== 'MADA') {
            return item;
          }
        });
      return generalResponse(res, completedPaymentArray, PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly adminOrderAndPaymentDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { searchText, limit, page, isAsc, sort, tab } = apiParams as any;
      let order;
      const isOrderAsc = isAsc === 'true';
      let search = {};

      if (searchText) {
        search = {
          [sequelize.Op.or]: [
            {
              '$storeInfo.company_name$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              '$supplierInfo.company_name$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              '$PaymentDetail.amount$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              uuid: {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      if (sort === 'amount') {
        order = [['PaymentDetail', 'amount', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'store') {
        order = [['storeInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'supplier') {
        order = [['supplierInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      }

      const orderDetail = await Orders.findAndCountAll({
        attributes: ['uuid', 'created_at'],
        where: {
          status: {
            [Op.ne]: 'PENDING',
          },
          ...search,
        } as any,
        include: [
          {
            model: StoreInfo,
            attributes: ['company_name'],
            as: 'storeInfo',
          },
          {
            model: SupplierInfo,
            attributes: ['company_name'],
            as: 'supplierInfo',
          },
          {
            model: PaymentDetail,
            attributes: ['amount', 'order_id', 'payment_status', 'payment_method_type'],
            where: {
              payment_status: 'SUCCESS',
              payment_method_type: tab,
            },
            as: 'PaymentDetail',
          } as any,
        ],
        subQuery: false,
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });

      return generalResponse(res, orderDetail, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly createBanktransfer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, orderId, supplier_info_uuid, purchaseReqId } = JSON.parse(req.body?.['bank-transfer']);

      const { filename } = req.file;

      const result = await db.transaction(async (t) => {
        const createPayment = await this.paymentdetailRepo.createRequest(
          {
            data: {
              order_id: orderId,
              payment_status: 'PENDING',
              amount: amount,
            },
            action: 'create',
          },
          { transaction: t },
        );

        await Orders.update(
          {
            payment_receipt: filename,
            payment_mode: 'BANK_TRANSFER',
          },
          {
            where: {
              purchase_request_id: purchaseReqId,
              uuid: orderId,
            },
            transaction: t,
          },
        );

        await SupplierQuotes.update(
          {
            payment_method: 'BANK_TRANSFER',
          },
          {
            where: {
              supplier_info_uuid: supplier_info_uuid,
              purchase_request_uuid: purchaseReqId,
            },
            transaction: t,
          },
        );

        const getOrderData = await this.orderRepository.get({
          where: { uuid: orderId },
          include: [
            { model: StoreInfo, attributes: ['uuid'] },
            { model: User, attributes: ['username', 'email', 'phone'] },
          ],
          transaction: t,
        });
        const OrderUserDetail = {
          orderId: orderId,
          username: getOrderData.user.username,
          email: getOrderData.user.email,
          phone: getOrderData.user.phone,
          link: `${FRONT_URL}/admin`,
        };
        const Notification = await this.notificationRepository.createNotification(
          {
            data: {
              related_entity_type: 'ORDERS',
              related_entity_id: orderId,
              content_en: PAYMENT_NOTIFICATIONS.NEW_PAYMENT_APPROVAL_RECEIVED_EN(
                getOrderData?.dataValues?.user?.dataValues?.username,
                orderId,
              ),
              content_ar: PAYMENT_NOTIFICATIONS.NEW_PAYMENT_APPROVAL_RECEIVED_AR(
                getOrderData?.dataValues?.user?.dataValues?.username,
                orderId,
              ),
              content_ur: PAYMENT_NOTIFICATIONS.NEW_PAYMENT_APPROVAL_RECEIVED_UR(
                getOrderData?.dataValues?.user?.dataValues?.username,
                orderId,
              ),
              link_to_entity: LINK_TO_ENTITY.PAYMENT_APPROVAL(orderId),
            },
            action: 'create',
          },
          { transaction: t },
        );

        await this.notificationReceiverRepository.createNotificationReciever(
          {
            data: {
              notification_uuid: Notification?.dataValues?.uuid,
              receiver_uuid: 'f29395e1-b97d-4278-8a79-8182299cb3a7', //admin uuid
            },
            action: 'create',
          },
          { transaction: t },
        );

        await this.notificationReceiverRepository.Notificationbroadcaster(
          [
            {
              notification_uuid: Notification?.dataValues?.uuid,
              receiver_uuid: 'f29395e1-b97d-4278-8a79-8182299cb3a7',
            },
          ],
          ['f29395e1-b97d-4278-8a79-8182299cb3a7'],
          t,
        );
      });

      return generalResponse(res, 'completed', PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly approvePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, payment_id, supplier_info_uuid, purchaseReqId } = req.body;

      const orderData = await this.orderRepository.get({
        where: { purchase_request_id: purchaseReqId, uuid: orderId, supplier_info_uuid: supplier_info_uuid },
      });

      await this.orderRepository.updateOrder({
        data: {
          status: 'ACCEPTED',
        },
        action: 'update',
        orderData,
      });

      const updatepaymentStatus = await PaymentDetail.update(
        {
          payment_status: 'SUCCESS',
        },

        {
          where: {
            order_id: orderId,
            uuid: payment_id,
          },
        },
      );

      await PurchaseRequests.update(
        {
          status: 'COMPLETED',
        },
        {
          where: {
            uuid: purchaseReqId,
            supplier_info_uuid: { [Op.not]: null },
            status: { [Op.ne]: 'BUY_NOW' },
          },
        },
      );

      await SupplierQuotes.update(
        {
          payment_method: 'BANK_TRANSFER',
          is_paid: true,
        },
        {
          where: {
            supplier_info_uuid: supplier_info_uuid,
            purchase_request_uuid: purchaseReqId,
          },
        },
      );

      const chatEntry = await this.chatRepository.get({ where: { order_uuid: orderId } });

      const getRequestType = await PurchaseRequests.findOne({ where: { uuid: purchaseReqId } });

      if (!chatEntry) {
        const accountUserRole = await AccountUsers.findOne({
          include: [
            {
              model: Roles,
              attributes: ['name'],
              where: { name: entityType.SUPPLIER_OWNER },
            },
          ],
          where: { entity_uuid: supplier_info_uuid },
        });
        const result = await db.transaction(async (t) => {
          const chat = await this.chatRepository.create(
            {
              order_uuid: orderData?.dataValues?.uuid,
              supplier_info_uuid: orderData?.dataValues?.supplier_info_uuid,
              store_info_uuid: orderData?.dataValues?.store_info_uuid,
              status: 'OPEN',
            },
            { transaction: t },
          );

          const userId = [orderData?.dataValues?.created_by, accountUserRole?.user_uuid];
          const chatUserEntry = userId.map((user: any) => {
            return {
              user_uuid: user,
              chat_uuid: chat?.dataValues?.uuid,
            };
          });
          await this.chatUserRepository.bulkCreate(chatUserEntry, { transaction: t });

          // notification for store (payment approved)

          await this.notificationRepository.NotificationCreateHandler({
            related_entity_id: orderId,
            related_entity_type: LINK_TO_ENTITY_CONSTANT.PAYMENT_APPROVAL,
            notification_type: PAYMENT_NOTIFICATIONS,
            notification_content: PAYMENT_NOTIFICATION_CONTENT.PAYMENT_APPROVED,
            permission_name: 'Track Purchase Request',
            permission_owner: 'STORE',
            entity_info_uuid: orderData?.dataValues?.store_info_uuid,
          });

          // notification for supplier (new order created)

          const getUsername = await this.accountUserRepository.get({
            where: { entity_uuid: orderData?.dataValues?.store_info_uuid },
            include: [
              { model: User, attributes: ['username', 'email'] },
              { model: StoreInfo, attributes: ['company_name'] },
            ],
          });

          await this.notificationRepository.NotificationCreateHandler({
            related_entity_id: orderData?.dataValues?.uuid,
            related_entity_type: LINK_TO_ENTITY_CONSTANT.ORDER,
            notification_type: ORDERS_NOTIFICATIONS,
            notification_content: ORDER_NOTIFICATION_CONTENT.SUPPLIER_NEW_ORDER,
            entity_uuid: getUsername.store_uuid.dataValues.company_name,
            permission_name: 'View Orders',
            permission_owner: 'SUPPLIER',
            entity_info_uuid: supplier_info_uuid,
          });

          const OrderUserDetail = {
            orderId: orderId,
            username: getUsername.user.username,
          };
        });
      }

      return generalResponse(res, 'completed', PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly declinePayment = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderId, supplier_info_uuid, purchaseReqId, payment_uuid } = req.body;
      const orderData = await this.orderRepository.get({
        where: { purchase_request_id: purchaseReqId, uuid: orderId, supplier_info_uuid: supplier_info_uuid },
      });

      await this.orderRepository.updateOrder({
        data: {
          payment_receipt: null,
        },
        action: 'update',
        orderData,
      });

      const updatepaymentStatus = await PaymentDetail.destroy({
        where: {
          uuid: payment_uuid,
        },
      });

      await SupplierQuotes.update(
        {
          payment_method: null,
          is_paid: null,
        },
        {
          where: {
            supplier_info_uuid: supplier_info_uuid,
            purchase_request_uuid: purchaseReqId,
          },
        },
      );

      const chatEntry = await this.chatRepository.get({ where: { order_uuid: orderId } });

      if (!chatEntry) {
        const accountUserRole = await AccountUsers.findOne({
          include: [
            {
              model: Roles,
              attributes: ['name'],
              where: { name: entityType.SUPPLIER_OWNER },
            },
          ],
          where: { entity_uuid: supplier_info_uuid },
        });
        const result = await db.transaction(async (t) => {
          const chat = await this.chatRepository.create(
            {
              order_uuid: orderData?.dataValues?.uuid,
              supplier_info_uuid: orderData?.dataValues?.supplier_info_uuid,
              store_info_uuid: orderData?.dataValues?.store_info_uuid,
              status: 'OPEN',
            },
            { transaction: t },
          );

          const userId = [orderData?.dataValues?.created_by, accountUserRole?.user_uuid];
          const chatUserEntry = userId.map((user: any) => {
            return {
              user_uuid: user,
              chat_uuid: chat?.dataValues?.uuid,
            };
          });

          await this.chatUserRepository.bulkCreate(chatUserEntry, { transaction: t });

          // payment decline notification for store
          await this.notificationRepository.NotificationCreateHandler({
            related_entity_id: purchaseReqId,
            related_entity_type: LINK_TO_ENTITY_CONSTANT.PURCHASE_REQUEST,
            notification_type: PAYMENT_NOTIFICATIONS,
            notification_content: PAYMENT_NOTIFICATION_CONTENT.PAYMENT_DECLINE,
            permission_name: 'Track Purchase Request',
            permission_owner: 'STORE',
            entity_info_uuid: orderData?.dataValues?.store_info_uuid,
          });

          const role = await Roles.findOne({
            where: {
              name: entityType.STORE_OWNER,
            },
          });
          const getUsername = await this.accountUserRepository.get({
            where: {
              [Op.and]: [
                {
                  entity_uuid: orderData?.dataValues?.store_info_uuid,
                },
                {
                  role_uuid: role.dataValues.uuid,
                },
              ],
            },
            include: [{ model: User, attributes: ['username', 'email'] }],
          });

          const OrderUserDetail = {
            orderId: orderId,
            username: getUsername.user.username,
          };
          const replacement = {
            SERVER_URL,
            key: 'OrderUserDetail',
            mainText: 'hello',
            OrderUserDetail: OrderUserDetail,
          };
          await sendMail([getUsername.user.email], 'Payment', 'notifyUserDeclineBankTransfer', replacement);
        });
      }

      return generalResponse(res, 'completed', PaymentCharge.PaymentChargeFETCHED, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly bankTransferList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { limit, page, isAsc, sort, searchText, extraParams } = apiParams as {
        limit: string;
        page: string;
        isAsc: string;
        sort: string;
        searchText: string;
        extraParams: any;
      };
      const [expiryDateFrom, expiryDateTo] = extraParams?.order_date || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
      const { store_info_uuid } = req.query;
      let order;
      const isOrderAsc = isAsc === 'true';
      if (sort === 'amount') {
        order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'date') {
        order = [['created_at', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'status') {
        order = [['orders', sort, isOrderAsc ? 'ASC' : 'DESC']];
      }

      let srch = {};

      if (searchText || extraParams?.status || extraParams?.amount || extraParams?.order_uuid) {
        srch = {
          [Op.or]: [
            {
              '$orders.status$': {
                [Op.like]: `%${searchText || extraParams?.status}%`,
              },
            },
            {
              '$PaymentDetail.amount$': {
                [Op.like]: `%${searchText || extraParams?.amount}%`,
              },
            },
            {
              order_id: {
                [Op.like]: `%${searchText || extraParams?.order_uuid}%`,
              },
            },
          ],
        };
      }
      let paymentWhere: any = {
        charge_id: null,
        ...srch,
      };
      if (extraParams?.order_date) {
        paymentWhere = {
          charge_id: null,
          ...srch,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }

      const orderDetail = await this.paymentdetailRepo.getAllData({
        attributes: ['order_id', 'amount', 'payment_status', 'created_at'],
        where: { ...paymentWhere },
        include: {
          model: Orders,
          where: {
            payment_mode: 'BANK_TRANSFER',
            store_info_uuid: store_info_uuid,
          },
          attributes: ['store_info_uuid', 'status'],
          include: [
            {
              model: StoreInfo,
              attributes: ['company_name'],
            },
          ],
        },
        limit: +limit,
        offset: +(Number(page) - 1) * +limit,
        order: order ? order : [['created_at', 'DESC']],
      });
      return generalResponse(res, orderDetail, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly bankTransferDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { store_info_uuid, orderId } = req.query;

      const singleOrder = await this.paymentdetailRepo.get({
        attributes: ['payment_status', 'amount'],
        where: {
          order_id: orderId as string,
        },
        include: [
          {
            model: Orders,
            attributes: ['status', 'created_at', 'payment_receipt', 'purchase_request_id'],
            where: { store_info_uuid: store_info_uuid },
            include: [
              {
                model: Address,
                attributes: {
                  exclude: ['uuid', 'user_uuid', 'created_at', 'updated_at', 'deleted_at', 'is_default', 'phone'],
                },
              },
              {
                model: StoreInfo,
                attributes: ['uuid', 'company_name', 'cr_number', 'tax_number'],
              },
              {
                model: SupplierInfo,
                attributes: ['uuid', 'company_name', 'cr_number', 'tax_number'],
              },
            ],
          },
        ],
      });
      return generalResponse(res, singleOrder, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly updateReceipt = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { store_info_uuid, orderId } = JSON.parse(req.body?.['bank-transfer']);
      const { filename } = req.file;

      const updateReciept = await Orders.update(
        {
          payment_receipt: filename,
          payment_mode: 'BANK_TRANSFER',
        },
        {
          where: {
            store_info_uuid: store_info_uuid,
            uuid: orderId,
          },
        },
      );
      return generalResponse(res, updateReciept, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly adminBankTransferList = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams } = req.query;
      const { searchText, limit, page, isAsc, sort, extraParams } = apiParams as any;
      const [expiryDateFrom, expiryDateTo] = extraParams?.order_date || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);
      let order;
      const isOrderAsc = isAsc === 'true';
      let srch = {};
      if (
        searchText ||
        extraParams?.supplier_company ||
        extraParams?.store_company ||
        extraParams?.amount ||
        extraParams?.order_uuid ||
        extraParams?.status
      ) {
        srch = {
          [Op.or]: [
            {
              '$storeInfo.company_name$': {
                [Op.like]: `%${searchText || extraParams?.store_company}%`,
              },
            },
            {
              '$supplierInfo.company_name$': {
                [Op.like]: `%${searchText || extraParams?.supplier_company}%`,
              },
            },
            {
              '$PaymentDetail.amount$': {
                [Op.like]: `%${searchText || extraParams?.amount}%`,
              },
            },
            {
              uuid: {
                [Op.like]: `%${searchText || extraParams?.order_uuid}%`,
              },
            },
            {
              status: {
                [Op.like]: `%${searchText || extraParams?.status}%`,
              },
            },
          ],
        };
      }
      if (sort === 'amount') {
        order = [['PaymentDetail', 'amount', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'store') {
        order = [['storeInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'supplier') {
        order = [['supplierInfo', 'company_name', isOrderAsc ? 'ASC' : 'DESC']];
      } else if (sort === 'status') {
        order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
      }

      let payemntWhere: any = {
        charge_id: null,
      };
      if (extraParams?.order_date) {
        payemntWhere = {
          ...payemntWhere,
          created_at: {
            [Op.gte]: formatedDateFrom,
            [Op.lte]: formatedDateTo,
          },
        };
      }
      const bankTransfer = await Orders.findAndCountAll({
        attributes: ['uuid', 'status', 'purchase_request_id', 'created_at'],
        where: {
          ...srch,
          payment_mode: 'BANK_TRANSFER',
          status: 'PENDING',
          payment_receipt: {
            [Op.not]: null,
          },
        },
        include: [
          {
            model: StoreInfo,
            attributes: ['company_name'],
            as: 'storeInfo',
          },
          {
            model: SupplierInfo,
            attributes: ['company_name'],
            as: 'supplierInfo',
          },
          {
            model: PaymentDetail,
            attributes: ['amount', 'created_at', 'payment_status'],
            as: 'PaymentDetail',
            where: {
              ...payemntWhere,
            },
          },
        ],
        subQuery: false,
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });

      return generalResponse(res, bankTransfer, USER_MESSAGES.SUCCESS, 'success', true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly retriveCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { store_info_uuid } = req.query as { store_info_uuid: string };

      const findAllCard = await SaveCard.findAll({
        where: { store_info_uuid: store_info_uuid },
        attributes: ['card_name', 'token_id'],
        order: [['created_at', 'DESC']],
      });
      if (findAllCard[0].card_name !== null) {
        return generalResponse(res, findAllCard, SAVE_CARD_MESSAGES.CARD_FETCHED, 'success', true, 200);
      } else {
        return generalResponse(res, [], SAVE_CARD_MESSAGES.UNIQUE_CARD_ERROR, 'failed', true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };

  public readonly payWithSaveCard = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { amount, order, req_id, supplierId, store_info_uuid, card_name, supplierProdId } = req.body;

      let encodedId1, encodedId2, encodedId3, mergeId;
      if (supplierProdId) {
        encodedId1 = btoa(req_id);
        encodedId2 = btoa(supplierId);
        encodedId3 = btoa(supplierProdId);
        mergeId = `${encodedId1}|${encodedId2}|${encodedId3}`;
      } else {
        encodedId1 = btoa(req_id);
        encodedId2 = btoa(supplierId);

        mergeId = `${encodedId1}|${encodedId2}`;
      }

      const findCard = await SaveCard.findOne({
        where: { store_info_uuid: store_info_uuid, card_name: card_name },
      });

      const apiUrl = `${TAP_URL}/charges`;

      const savecardUrl = `${TAP_URL}/tokens`;

      const saveCardData = {
        saved_card: {
          card_id: findCard?.dataValues?.card_id,
          customer_id: findCard?.dataValues?.customer_id,
        },
      };

      const requestHeaders = {
        Authorization: TAP_AUTHORIZATION,
        accept: 'application/json',
        'content-type': 'application/json',
      };

      const savedCardRes = await axios.post(savecardUrl, saveCardData, {
        headers: requestHeaders,
      });

      const updateCard = await SaveCard.update(
        {
          token_id: savedCardRes?.data?.id,
        },
        {
          where: {
            store_info_uuid: store_info_uuid,
          },
        },
      );

      const data = {
        amount: amount,
        currency: 'SAR',
        customer_initiated: true,
        threeDSecure: true,
        save_card: true,
        reference: { transaction: order, order: order },
        receipt: { email: true, sms: true },
        customer: {
          id: savedCardRes?.data?.card?.customer,
        },
        source: { id: savedCardRes?.data?.id ? savedCardRes?.data?.id : 'src_all' },

        post: { url: `${FRONT_URL}/checkout-process/${mergeId}` },
        redirect: { url: `${FRONT_URL}/checkout-process/${mergeId}` },
      };

      const response = await axios.post(apiUrl, data, { headers: requestHeaders });

      if (response?.data?.status === 'INITIATED') {
        const result = await db.transaction(async (t) => {
          const createPayment = await this.paymentdetailRepo.createRequest(
            {
              data: {
                order_id: order,
                payment_status: 'PENDING',
                amount: amount,
                charge_id: response?.data?.id,
              },
              action: 'create',
            },
            { transaction: t },
          );
        });

        return generalResponse(
          res,
          response.data?.transaction?.url,
          PaymentCharge.PaymentChargeCREATED,
          'success',
          true,
          200,
        );
      } else if (response?.data?.status === 'CAPTURED') {
        const result = await db.transaction(async (t) => {
          const createPayment = await this.paymentdetailRepo.createRequest(
            {
              data: {
                order_id: order,
                payment_status: 'PENDING',
                amount: amount,
                charge_id: response?.data?.id,
              },
              action: 'create',
            },
            { transaction: t },
          );
        });
        const getOrderId = await this.orderRepository.get({
          where: { purchase_request_id: req_id, supplier_info_uuid: supplierId },
        });

        const paymentDetail = await this.paymentdetailRepo.get({
          where: { order_id: getOrderId?.dataValues?.uuid, charge_id: response?.data?.id },
        } as {});

        await Orders.update(
          {
            payment_mode: 'CARD',
            status: 'ACCEPTED',
          },
          {
            where: {
              purchase_request_id: req_id,
              uuid: getOrderId?.dataValues?.uuid,
            },
          },
        );
        await SupplierQuotes.update(
          {
            is_paid: true,
            payment_method: 'CARD',
          },
          {
            where: {
              supplier_info_uuid: getOrderId?.dataValues?.supplier_info_uuid as string,
              purchase_request_uuid: req_id as string,
            },
          },
        );
        const buyNowReq = await PurchaseRequests.findOne({
          where: {
            uuid: req_id,
            supplier_info_uuid: { [Op.not]: null },
            status: { [Op.eq]: 'BUY_NOW' },
          },
        });
        const getSupplierQuote = await this.supplierQuotesRepository.get({
          where: {
            supplier_info_uuid: getOrderId?.dataValues?.supplier_info_uuid as string,
            purchase_request_uuid: req_id as string,
          },
          attributes: ['uuid'],
        });
        if (!buyNowReq) {
          await SupplierProductQuotes.update(
            {
              is_approved: true,
            },
            {
              where: {
                supplier_quotes_uuid: getSupplierQuote.dataValues.uuid,
              },
            },
          );
        }
        await this.paymentdetailRepo.updatePaymentDetail({
          data: {
            payment_status: response?.data?.status === 'CAPTURED' ? 'SUCCESS' : 'FAILED',
            payment_method_type: response?.data?.card?.scheme,
          },
          action: 'update',
          paymentDetail,
        });
        const chatEntry = await this.chatRepository.get({ where: { order_uuid: getOrderId?.dataValues?.uuid } });

        const getUsername = await this.accountUserRepository.get({
          where: { entity_uuid: getOrderId?.dataValues?.store_info_uuid },
          include: [
            { model: User, attributes: ['username', 'email'] },
            { model: StoreInfo, attributes: ['company_name'] },
          ],
        });

        if (!chatEntry) {
          const accountUserRole = await AccountUsers.findOne({
            include: [
              {
                model: Roles,
                attributes: ['name'],
                where: { name: entityType.SUPPLIER_OWNER },
              },
            ],
            where: { entity_uuid: getOrderId?.dataValues?.supplier_info_uuid },
          });

          await db.transaction(async (t) => {
            const chat = await this.chatRepository.create(
              {
                order_uuid: getOrderId?.dataValues?.uuid,
                supplier_info_uuid: getOrderId?.dataValues?.supplier_info_uuid,
                store_info_uuid: getOrderId?.dataValues?.store_info_uuid,
                status: 'OPEN',
              },
              { transaction: t },
            );

            const userId = [getOrderId?.dataValues?.created_by, accountUserRole?.user_uuid];

            const chatUserEntry = userId.map((user: any) => {
              return {
                user_uuid: user,
                chat_uuid: chat?.dataValues?.uuid,
              };
            });
            await this.chatUserRepository.bulkCreate(chatUserEntry, { transaction: t });
          });
        }
        // supplier has new order notification
        await this.notificationRepository.NotificationCreateHandler({
          related_entity_id: getOrderId?.dataValues?.uuid,
          related_entity_type: LINK_TO_ENTITY_CONSTANT.ORDER,
          notification_type: ORDERS_NOTIFICATIONS,
          notification_content: ORDER_NOTIFICATION_CONTENT.SUPPLIER_NEW_ORDER,
          entity_uuid: getUsername.store_uuid.dataValues.company_name,
          permission_name: 'View Orders',
          permission_owner: 'SUPPLIER',
          entity_info_uuid: getOrderId?.dataValues?.supplier_info_uuid,
        });

        return generalResponse(res, response?.data?.status, PaymentCharge.PaymentChargeCREATED, 'success', true, 200);
      } else {
        return generalResponse(res, null, PaymentCharge.Payment_FAILED, 'failed', true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, 'failed', false, 400);
    }
  };
}

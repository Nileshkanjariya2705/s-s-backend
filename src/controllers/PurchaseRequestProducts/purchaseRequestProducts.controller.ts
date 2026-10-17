import PurchaseRequestProductsRepo from '@/repository/PurchaseRequestProducts/purchaseRequestProducts.repository';
import { Request, NextFunction, Response } from 'express';
import db from '@/models';
import { generalResponse, responseType, statusType } from '@/helper/common.helper';
import { PURCHASE_REQUEST_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import Products from '@/models/products.model';
import Category from '@/models/category.model';
import { Op, col, fn } from 'sequelize';
import moment from 'moment';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import SupplierProductQuotesRepo from '@/repository/SupplierProductQuotes/supplierProductQuotes.repository';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import AccountUsers from '@/models/accountUsers.model';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { PURCHASE_REQUEST_NOTIFICATIONS } from '@/messages/notificationMessages';
import User from '@/models/user.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import RolePermissions from '@/models/rolePermissions.model';
import Reviews from '@/models/reviews.model';
import { LINK_TO_ENTITY_CONSTANT, PURCHASE_REQUEST_NOTIFICATION_CONTENT } from '@/constants/notification';
import Measurement from '@/models/measurement.model';
import Address from '@/models/address.model';
export class PurchaseRequestProductsController {
  constructor(
    private readonly purchaseRequestRepository: PurchaseRequestRepo,
    private readonly purchaseRequestProductsRepository: PurchaseRequestProductsRepo,
    private readonly supplierQuotesRepository: SupplierQuotesRepo,
    private readonly supplierProductQuotesRepository: SupplierProductQuotesRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationReceiverRepository: NotificationRecieverRepo,
    private readonly accountUserRepository: AccountUsersRepo,
  ) {}
  public readonly purchaseRequestProductGet = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId, tab, apiParams } = req.query;
      const { page, limit } = apiParams as { page: string; limit: string };
      await db.transaction(async (t) => {
        const getPurchaseRequest: any = await this.purchaseRequestRepository.get({
          where: {
            uuid: purchaseReqId as string,
          },
          include: [
            {
              model: PurchaseRequestProducts,
            },
          ],
          transaction: t,
        });
        if (!getPurchaseRequest) {
          return generalResponse(
            res,
            null,
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_NOT_FOUND,
            responseType.SUCCESS,
            true,
            200,
          );
        }

        const getSupplierQuotes = await this.supplierQuotesRepository.getAllData({
          where: {
            purchase_request_uuid: purchaseReqId as string,
          },
          attributes: [
            'charges_and_total',
            'supplier_info_uuid',
            'uuid',
            'charges_and_total',
            'is_paid',
            'payment_method',
            'charges',
          ],
          include: [
            {
              model: SupplierProductQuotes,
              attributes: ['offered_price', 'offered_quantity'],
              where: {
                is_approved: tab === statusType.ACTIVE ? { [Op.or]: [true, null] } : false,
                offered_price: { [Op.ne]: null },
              },
              include: [
                {
                  model: Products,
                  attributes: ['name_en', 'name_ar', 'name_ur'],
                  paranoid: false,
                  include: [
                    {
                      model: Category,
                      attributes: ['name', 'name_ar', 'name_ur'],
                    },
                    {
                      model: Measurement,
                      attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
                    },
                  ],
                },
                {
                  model: PurchaseRequestProducts,
                  attributes: ['uuid', 'requested_quantity'],
                  include: [
                    {
                      model: Products,
                      paranoid: false,
                      attributes: ['name_en', 'name_ar', 'name_ur'],
                      include: [
                        {
                          model: Category,
                          attributes: ['name', 'name_ar', 'name_ur'],
                        },
                        {
                          model: Measurement,
                          attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
          limit: +limit,
          offset: (+page - 1) * +limit,
        });
        if (getSupplierQuotes.count === 0) {
          return generalResponse(
            res,
            { data: [], count: getSupplierQuotes.count },
            PURCHASE_REQUEST_MESSAGES.SUPPLIER_QUOTE_NOT_FOUND,
            responseType.SUCCESS,
            true,
            200,
          );
        }

        const averageRatings = await Reviews.findAll({
          attributes: [
            'supplier_info_uuid',
            [fn('AVG', col('rating')), 'averageRating'], // Calculate the average rating
          ],
          where: {
            supplier_info_uuid: {
              [Op.in]: getSupplierQuotes.rows.map((item) => item.dataValues?.supplier_info_uuid),
            },
          },
          group: ['supplier_info_uuid'], // Group by supplier_info_uuid
        });

        averageRatings.forEach((average) => {
          const supplierUUID = average.supplier_info_uuid;
          const correspondingSupplier: any = getSupplierQuotes.rows.find(
            (item) => item.dataValues.supplier_info_uuid === supplierUUID,
          );

          if (correspondingSupplier) {
            correspondingSupplier.dataValues.averageRating = average.get('averageRating');
          }
        });
        const updatedData = getSupplierQuotes.rows.map((item) => ({
          ...item.dataValues,
          tab: tab,
          totalPrd: getPurchaseRequest.dataValues.PurchaseRequestProducts.length,
        }));

        return generalResponse(
          res,
          { data: updatedData, count: getSupplierQuotes.count },
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly createDirectPurchaseReqByStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_details, offer_for_entire_request, expiry_date, store_info_uuid, requester_uuid, address_uuid } =
        req?.body;
      let date = new Date(expiry_date);
      const formatedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
      let purchase_request;
      let productPurchaseReq;
      const totalCost = product_details.reduce((acc, item) => {
        const price = parseFloat(item.requested_price);
        const quantity = parseFloat(item.quantity);
        const itemCost = price * quantity;
        return acc + itemCost;
      }, 0);

      const getBranchDetails = await Address.findOne({
        where: {
          uuid: address_uuid,
        },
        attributes:['branch_uuid','uuid']
      });

      await db.transaction(async (t) => {
        purchase_request = await this.purchaseRequestRepository.createRequest(
          {
            data: {
              requester_uuid: requester_uuid,
              store_info_uuid: store_info_uuid,
              quotes_accepted_upto: formatedDate,
              total_price: totalCost,
              offer_for_entire_request: offer_for_entire_request,
              status: 'NEW',
              branch_uuid: getBranchDetails.branch_uuid,
              address_uuid: getBranchDetails.uuid
            },
            action: 'create',
          },
          { transaction: t },
        );
        const bulkData = product_details?.map((item) => {
          return {
            purchase_request_uuid: purchase_request?.dataValues?.uuid,
            category_uuid: item?.category,
            product_uuid: item?.product,
            requested_price: item?.requested_price,
            requested_quantity: item?.quantity,
            allow_other_brands: item?.other_brands_allowed,
            description: item?.description,
          };
        });

        productPurchaseReq = await this.purchaseRequestProductsRepository.bulkCreate(bulkData, { transaction: t });

        const getUsername = await AccountUsers.findOne({
          attributes: ['entity_uuid'],
          where: { user_uuid: requester_uuid },
        });

        // To send Notification to all the Suppliers having Quotes permission
        const getRolesWithPermission = await RolePermissions.findAll({
          where: {
            permission_uuid: 'cda07216-f5c4-4d0e-8500-c403b7411ce0',
          },
        });

        const roleIds = [];
        getRolesWithPermission.map((data) => {
          roleIds.push(data.dataValues.role_uuid);
        });
        const getSpecificUsers = await this.accountUserRepository.getAll({
          where: { entity_type: 'SUPPLIER', role_uuid: { [Op.in]: roleIds } },
        });

        const specificUserIds =
          getSpecificUsers &&
          getSpecificUsers.map((data) => {
            return data.dataValues.user_uuid;
          });

        await this.notificationRepository.NotificationCreateHandler({
          related_entity_id: purchase_request?.dataValues?.uuid,
          related_entity_type: LINK_TO_ENTITY_CONSTANT.PURCHASE_REQUEST,
          notification_type: PURCHASE_REQUEST_NOTIFICATIONS,
          notification_content: PURCHASE_REQUEST_NOTIFICATION_CONTENT.PURCHASE_REQUEST_REQUEST_QUOTE,
          entity_uuid: getUsername.dataValues.entity_uuid,
          notification_reciever: specificUserIds,
        });
      });

      return generalResponse(
        res,
        productPurchaseReq,
        PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_CREATED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateAndInsertProductReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { product_details, purchase_request, expiry_date, removAbleuuid, offer_for_entire_request ,address_uuid} = req?.body;
      const getPurchaseRequest: any = await this.purchaseRequestRepository.get({
        where: {
          uuid: purchase_request as string,
        },
      });
      if (getPurchaseRequest) {
        let date = new Date(expiry_date);
        const formatedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
        removAbleuuid &&
          Array.isArray(removAbleuuid) &&
          removAbleuuid?.length > 0 &&
          (await Promise.all(
            removAbleuuid.map((uuid) => {
              return this.purchaseRequestProductsRepository.deleteData({
                where: {
                  uuid: uuid,
                },
              });
            }),
          ));

        const bulkData = product_details?.map((item) => {
          return {
            purchase_request_uuid: purchase_request,
            category_uuid: item?.category,
            product_uuid: item?.product,
            requested_price: item?.requested_price,
            requested_quantity: item?.quantity,
            allow_other_brands: item?.other_brands_allowed,
            description: item?.description,
            ...(item?.uuid && { ['uuid']: item?.uuid }),
          };
        });

        const upadated_total = product_details.reduce((accumulator, product) => {
          const quantity = product.quantity;
          const requested_price = product.requested_price;
          const totalPrice = quantity * requested_price;
          return accumulator + totalPrice;
        }, 0);
        await db.transaction(async (t) => {
          await Promise.all(
            bulkData.map((item) => {
              return this.purchaseRequestProductsRepository.upsert(item, { transaction: t });
            }),
          );
          const response = await PurchaseRequests.update(
            {
              offer_for_entire_request: offer_for_entire_request,
              quotes_accepted_upto: formatedDate,
              total_price: upadated_total,
              address_uuid: address_uuid
            },
            { where: { uuid: purchase_request }, transaction: t },
          );
        });
        return generalResponse(
          res,
          null,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_UPDATED,
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(
          res,
          null,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_DETAIL_NOT_FOUND,
          responseType.SUCCESS,
          true,
          200,
        );
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly rejectSupplierQuote = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { purchaseReqId, supplier_info_uuid, tab, uuid } = req.query;
        const getSupplierQuote = await this.supplierQuotesRepository.get({
          where: {
            supplier_info_uuid: supplier_info_uuid as string,
            purchase_request_uuid: purchaseReqId as string,
          },
          attributes: ['uuid'],
        });

        const getUsername = await User.findOne({ where: { uuid: uuid as string } });

        await this.notificationRepository.NotificationCreateHandler({
          related_entity_id: purchaseReqId as string,
          related_entity_type: LINK_TO_ENTITY_CONSTANT.PURCHASE_REQUEST,
          notification_type: PURCHASE_REQUEST_NOTIFICATIONS,
          notification_content: PURCHASE_REQUEST_NOTIFICATION_CONTENT.PURCHASE_REQUEST_QUOTE_REJECTED,
          entity_uuid: getUsername?.dataValues.username,
          permission_name: 'Send Quotes',
          permission_owner: 'SUPPLIER',
          entity_info_uuid: supplier_info_uuid as string,
        });

        if (!getSupplierQuote) {
          return generalResponse(
            res,
            '',
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_QUOTE_DELETED_FAILED,
            responseType.SUCCESS,
            true,
            200,
          );
        }
        if (tab === statusType.ACTIVE) {
          await SupplierProductQuotes.update(
            {
              is_approved: false,
            },
            {
              where: {
                supplier_quotes_uuid: getSupplierQuote.dataValues.uuid,
              },
            },
          );
          return generalResponse(
            res,
            tab,
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_QUOTE_REJECTED,
            responseType.SUCCESS,
            true,
            200,
          );
        } else {
          await this.supplierProductQuotesRepository.deleteData({
            where: {
              supplier_quotes_uuid: getSupplierQuote.dataValues.uuid,
            },
          });
          return generalResponse(
            res,
            tab,
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_QUOTE_DELETED,
            responseType.SUCCESS,
            true,
            200,
          );
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly createExistingPurchaseReqByStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await db.transaction(async (t) => {
        const { quotes_accepted_upto, requested_price, quantity, description, supplier_uuid, requester_uuid } =
          req.body;
        let date = new Date(quotes_accepted_upto);
        const formatedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
        const getSupplierInfoId = await AccountUsers.findOne({ where: { user_uuid: supplier_uuid } });

        const purchase_request = await this.purchaseRequestRepository.createRequest(
          {
            data: {
              ...req.body,
              quotes_accepted_upto: formatedDate,
              total_price: Number(requested_price) * Number(quantity),
              supplier_info_uuid: getSupplierInfoId.dataValues.entity_uuid,
            },
            action: 'create',
          },
          { transaction: t },
        );

        const productPurchaseReq = await this.purchaseRequestProductsRepository.createPurchaseRequestProduct(
          {
            data: {
              ...req.body,
              purchase_request_uuid: purchase_request?.dataValues?.uuid,
              requested_quantity: quantity,
              status: 'NEW',
              description: description,
            },
            action: 'create',
          },
          { transaction: t },
        );

        const getUsername = await AccountUsers.findOne({
          attributes: ['entity_uuid'],
          where: { user_uuid: requester_uuid },
        });

        const getEntityUuid = await this.accountUserRepository.get({ where: { user_uuid: supplier_uuid } });

        await this.notificationRepository.NotificationCreateHandler({
          related_entity_id: purchase_request?.dataValues?.uuid,
          related_entity_type: LINK_TO_ENTITY_CONSTANT.PURCHASE_REQUEST,
          notification_type: PURCHASE_REQUEST_NOTIFICATIONS,
          notification_content: PURCHASE_REQUEST_NOTIFICATION_CONTENT.PURCHASE_REQUEST_REQUEST_QUOTE,
          entity_uuid: getUsername?.dataValues.entity_uuid,
          permission_name: 'Send Quotes',
          permission_owner: 'SUPPLIER',
          entity_info_uuid: getEntityUuid.dataValues.entity_uuid,
        });

        return generalResponse(
          res,
          productPurchaseReq,
          PURCHASE_REQUEST_MESSAGES.REQUEST_CREATED,
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

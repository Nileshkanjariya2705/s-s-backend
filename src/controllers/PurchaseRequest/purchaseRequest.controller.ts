import { formatDateString, generalResponse, responseType } from '@/helper/common.helper';
import { PURCHASE_REQUEST_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import { NextFunction, Request, Response } from 'express';
import SupplierProductQuotesRepo from '@/repository/SupplierProductQuotes/supplierProductQuotes.repository';
import { Model, Op, Sequelize } from 'sequelize';
import moment from 'moment';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import Products from '@/models/products.model';
import Measurement from '@/models/measurement.model';
import SupplierQuotes from '@/models/supplierQuotes.model';
import Category from '@/models/category.model';
import AccountUsers from '@/models/accountUsers.model';
import PurchaseRequestProductsRepo from '@/repository/PurchaseRequestProducts/purchaseRequestProducts.repository';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import Orders from '@/models/orders.model';
import OrderProducts from '@/models/orderProduct.model';
import { LINK_TO_ENTITY, PAYMENT_NOTIFICATIONS, PURCHASE_REQUEST_NOTIFICATIONS } from '@/messages/notificationMessages';
import PurchaseRequests from '@/models/purchaseRequest.model';
import NotificationReciever from '@/models/notificationReciever.model';
import Permissions from '@/models/permissions.model';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import AdminSettings from '@/models/adminSettings.model';
import {
  LINK_TO_ENTITY_CONSTANT,
  PAYMENT_NOTIFICATION_CONTENT,
  PURCHASE_REQUEST_NOTIFICATION_CONTENT,
} from '@/constants/notification';
import { GeneralResponse } from '@/interfaces/general.interface';
import SupplierProducts from '@/models/supplierProducts.model';
import Branch from '@/models/branches.model';
import Address from '@/models/address.model';

export class PurchaseRequestController {
  constructor(
    private readonly purchaseRequestRepository: PurchaseRequestRepo,
    private readonly purchaseRequestProductsRepository: PurchaseRequestProductsRepo,
    private readonly supplierProductQuotesRepository: SupplierProductQuotesRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly supplerQuotesRepository: SupplierQuotesRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationReceiverRepository: NotificationRecieverRepo,
  ) {}
  public readonly purchaseRequestCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const request_expiry = req.body.request_expiry;
      const formattedDate = moment(request_expiry).format('YYYY-MM-DD HH:mm:ss');
      await db.transaction(async (t) => {
        await this.purchaseRequestRepository.createRequest(
          {
            data: {
              ...req.body,
              request_expiry: formattedDate,
            },
            action: 'create',
          },
          { transaction: t },
        );
      });
      return generalResponse(res, '', PURCHASE_REQUEST_MESSAGES.REQUEST_CREATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllPurchaseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { selectedTab, entity_uuid, apiParams }: any = req.query;
      const { page, limit, sort, isAsc, searchText, extraParams } = apiParams;
      const [expiryDateFrom, expiryDateTo] = extraParams?.date || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);

      const isOrderAsc = isAsc === 'true';

      if (selectedTab === 'QUOTED') {
        let order;

        if (sort) {
          if (sort === 'created_at') {
            order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
          } else if (sort === 'offered_quantity') {
            order = [['supplier_quote', 'supplier_product_quotes', 'offered_quantity', isOrderAsc ? 'ASC' : 'DESC']];
          } else if (sort === 'requested_price') {
            order = [['supplier_quote', 'supplier_product_quotes', 'offered_price', isOrderAsc ? 'ASC' : 'DESC']];
          } else if (sort === 'charges_and_total') {
            order = [['supplier_quote', 'charges_and_total', isOrderAsc ? 'ASC' : 'DESC']];
          }
        }
        let search = {};

        if (searchText) {
          search = {
            [Op.or]: [
              {
                '$supplier_quote.charges_and_total$': {
                  [Op.like]: `%${searchText}%`,
                },
              },
            ],
          };
        }

        const result = await db.transaction(async (t) => {
          const data = await SupplierQuotes.findAll({
            where: {
              supplier_info_uuid: entity_uuid,
            },
          });
          const purchaseRequestIds = data.map((item) => item.purchase_request_uuid);
          let purchaseWhere: any = {
            [Op.or]: [
              {
                supplier_info_uuid: entity_uuid,
              },
              {
                supplier_info_uuid: null,
              },
            ],

            uuid: {
              [Op.in]: purchaseRequestIds,
            },
            status: {
              [Op.notIn]: ['COMPLETED', 'EXPIRED'],
            },
          };
          if (extraParams?.purchaseReqId && extraParams?.date) {
            purchaseWhere = {
              [Op.or]: [
                {
                  supplier_info_uuid: entity_uuid,
                },
                {
                  supplier_info_uuid: null,
                },
              ],
              [Op.and]: [
                {
                  uuid: {
                    [Op.in]: purchaseRequestIds,
                  },
                },
                {
                  uuid: {
                    [Op.like]: `%${extraParams?.purchaseReqId}%`,
                  },
                },
              ],
              status: {
                [Op.notIn]: ['COMPLETED', 'EXPIRED'],
              },
              created_at: {
                [Op.gte]: formatedDateFrom,
                [Op.lte]: formatedDateTo,
              },
            };
          } else if (extraParams?.purchaseReqId) {
            purchaseWhere = {
              [Op.or]: [
                {
                  supplier_info_uuid: entity_uuid,
                },
                {
                  supplier_info_uuid: null,
                },
              ],
              [Op.and]: [
                {
                  uuid: {
                    [Op.in]: purchaseRequestIds,
                  },
                },
                {
                  uuid: {
                    [Op.like]: `%${extraParams?.purchaseReqId}%`,
                  },
                },
              ],
              status: {
                [Op.notIn]: ['COMPLETED', 'EXPIRED'],
              },
            };
          } else if (extraParams?.date) {
            purchaseWhere = {
              [Op.or]: [
                {
                  supplier_info_uuid: entity_uuid,
                },
                {
                  supplier_info_uuid: null,
                },
              ],
              uuid: {
                [Op.in]: purchaseRequestIds,
              },
              status: {
                [Op.notIn]: ['COMPLETED', 'EXPIRED'],
              },
              created_at: {
                [Op.gte]: formatedDateFrom,
                [Op.lte]: formatedDateTo,
              },
            };
          }
          let purProductWhere = { ...search };
          if (extraParams?.price && extraParams?.quantity) {
            purProductWhere = {
              offered_price: extraParams.price,
              offered_quantity: extraParams.quantity,
            };
          } else if (extraParams?.price) {
            purProductWhere = {
              offered_price: extraParams.price,
            };
          } else if (extraParams?.quantity) {
            purProductWhere = {
              offered_quantity: extraParams.quantity,
            };
          }
          const finalResponse = await this.purchaseRequestRepository.getAllData({
            attributes: ['offer_for_entire_request', 'uuid', 'quotes_accepted_upto', 'created_at'],
            where: {
              ...purchaseWhere,
            },
            transaction: t,
            limit: +limit,
            offset: (+page - 1) * +limit,
            order: order ? order : [['created_at', 'DESC']],
            include: [
              {
                model: SupplierQuotes,
                as: 'supplier_quote',
                attributes: ['charges_and_total', 'uuid', 'payment_method'],
                where: {
                  supplier_info_uuid: entity_uuid,
                  [Op.or]: [
                    {
                      is_paid: false,
                    },
                    {
                      is_paid: null,
                    },
                  ],
                  ...search,
                },

                include: [
                  {
                    model: SupplierProductQuotes,
                    as: 'supplier_product_quotes',
                    attributes: [
                      'other_brand_product_uuid',
                      'offered_price',
                      'offered_quantity',
                      'is_approved',
                      'purchase_request_products_uuid',
                    ],
                    where: { ...purProductWhere },
                    include: [
                      {
                        model: Products,
                        attributes: [
                          'uuid',
                          'name_en',
                          'category_uuid',
                          'measurement_uuid',
                          'name_ar',
                          'name_ur',
                          'featured_image',
                          'description_en',
                          'description_ar',
                          'description_ur',
                        ],
                        include: [
                          {
                            model: Category,
                            attributes: ['name', 'uuid'],
                          },
                          {
                            model: Measurement,
                            attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur', 'unit_short_name'],
                          },
                        ],
                      },
                      {
                        model: PurchaseRequestProducts,
                        attributes: { exclude: ['description', 'created_at', 'updated_at', 'deleted_at'] },
                        include: [
                          {
                            model: Products,
                            attributes: [
                              'uuid',
                              'name_en',
                              'category_uuid',
                              'measurement_uuid',
                              'name_ar',
                              'name_ur',
                              'featured_image',
                              'description_en',
                              'description_ar',
                              'description_ur',
                            ],
                            include: [
                              {
                                model: Category,
                                attributes: ['name', 'uuid'],
                              },
                              {
                                model: Measurement,
                                attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur', 'unit_short_name'],
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
          return generalResponse(
            res,
            { result: finalResponse, tab: selectedTab },
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
            responseType.SUCCESS,
            false,
            200,
          );
        });
      } else {
        let order;

        if (sort) {
          if (sort === 'created_at') {
            order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
          } else if (sort === 'requested_price') {
            order = [['PurchaseRequestProducts', 'requested_price', isOrderAsc ? 'ASC' : 'DESC']];
          } else if (sort === 'quantity') {
            order = [['PurchaseRequestProducts', 'requested_quantity', isOrderAsc ? 'ASC' : 'DESC']];
          }
        }
        let search = {};
        if (searchText) {
          search = {
            [Op.or]: [
              {
                '$PurchaseRequestProducts.requested_price$': {
                  [Op.like]: `%${searchText}%`,
                },
              },
              {
                '$PurchaseRequestProducts.requested_quantity$': {
                  [Op.like]: `%${searchText}%`,
                },
              },
            ],
          };
        }

        const result = await db.transaction(async (t) => {
          const data = await SupplierQuotes.findAll({
            transaction: t,
            where: {
              supplier_info_uuid: entity_uuid,
            },
          });
          const purchaseRequestIds = data.map((item) => item.purchase_request_uuid);
          let date = new Date(extraParams?.date);
          const formatedDate = moment(date).format('YYYY-MM-DD HH:mm:ss');
          const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');
          let purchaseWhere: any = {
            [Op.or]: [
              {
                supplier_info_uuid: entity_uuid,
              },
              {
                supplier_info_uuid: null,
              },
            ],
            quotes_accepted_upto: {
              [Op.gt]: currentDate,
            },
            uuid: {
              [Op.notIn]: purchaseRequestIds,
            },
            status: {
              [Op.notIn]: ['COMPLETED', 'EXPIRED', 'BUY_NOW'],
            },
          };
          if (extraParams?.purchaseReqId && extraParams?.date) {
            purchaseWhere = {
              [Op.or]: [
                {
                  supplier_info_uuid: entity_uuid,
                },
                {
                  supplier_info_uuid: null,
                },
              ],
              [Op.and]: [
                {
                  uuid: {
                    [Op.notIn]: purchaseRequestIds,
                  },
                },
                {
                  uuid: {
                    [Op.like]: `%${extraParams?.purchaseReqId}%`,
                  },
                },
              ],
              status: {
                [Op.notIn]: ['COMPLETED', 'EXPIRED', 'BUY_NOW'],
              },
              created_at: {
                [Op.gte]: formatedDateFrom,
                [Op.lte]: formatedDateTo,
              },
            };
          } else if (extraParams?.purchaseReqId) {
            purchaseWhere = {
              [Op.or]: [
                {
                  supplier_info_uuid: entity_uuid,
                },
                {
                  supplier_info_uuid: null,
                },
              ],
              [Op.and]: [
                {
                  uuid: {
                    [Op.notIn]: purchaseRequestIds,
                  },
                },
                {
                  uuid: {
                    [Op.like]: `%${extraParams?.purchaseReqId}%`,
                  },
                },
              ],
              status: {
                [Op.notIn]: ['COMPLETED', 'EXPIRED', 'BUY_NOW'],
              },
            };
          } else if (extraParams?.date) {
            purchaseWhere = {
              [Op.or]: [
                {
                  supplier_info_uuid: entity_uuid,
                },
                {
                  supplier_info_uuid: null,
                },
              ],
              uuid: {
                [Op.notIn]: purchaseRequestIds,
              },
              status: {
                [Op.notIn]: ['COMPLETED', 'EXPIRED', 'BUY_NOW'],
              },
              created_at: {
                [Op.gte]: formatedDateFrom,
                [Op.lte]: formatedDateTo,
              },
            };
          }
          let purProductWhere = { ...search };
          if (extraParams?.price && extraParams?.quantity) {
            purProductWhere = {
              requested_price: extraParams.price,
              requested_quantity: extraParams.quantity,
              ...search,
            };
          } else if (extraParams?.price) {
            purProductWhere = {
              requested_price: extraParams.price,
              ...search,
            };
          } else if (extraParams?.quantity) {
            purProductWhere = {
              requested_quantity: extraParams.quantity,
              ...search,
            };
          }
          const finalResponse = await this.purchaseRequestRepository.getAllData({
            attributes: ['offer_for_entire_request', 'uuid', 'quotes_accepted_upto', 'created_at'],
            where: {
              ...purchaseWhere,
            },

            limit: +limit,
            offset: (+page - 1) * +limit,
            transaction: t,
            order: order ? order : [['created_at', 'DESC']],

            include: [
              {
                model: PurchaseRequestProducts,
                as: 'PurchaseRequestProducts',
                attributes: { exclude: ['description'] },
                where: { ...purProductWhere },

                include: [
                  {
                    model: Products,
                    as: 'products',
                    attributes: [
                      'name_en',
                      'uuid',
                      'name_ur',
                      'name_ar',
                      'featured_image',
                      'description_en',
                      'description_ar',
                      'description_ur',
                    ],
                    include: [
                      {
                        model: Category,
                        attributes: ['name', 'uuid'],
                      },
                      {
                        model: Measurement,
                        attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur', 'uuid', 'unit_short_name'],
                      },
                    ],
                  },
                ],
              },
            ],
          });
          return generalResponse(
            res,
            { result: finalResponse, tab: selectedTab },
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
            responseType.SUCCESS,
            false,
            200,
          );
        });
      }
      // } else if (selectedTab === 'CLOSED') {
      //   const result = await db.transaction(async (t) => {
      //     const [withInclude, withoutInclude] = await Promise.all([
      //       this.purchaseRequestRepository.getAllData({
      //         where: {
      //           status: {
      //             [Op.in]: ['COMPLETED', 'EXPIRED', 'QUOTED'],
      //           },
      //           [Op.or]: [
      //             {
      //               supplier_info_uuid: entity_uuid,
      //             },
      //             {
      //               supplier_info_uuid: null,
      //             },
      //           ],
      //         },
      //         order: [['created_at', 'DESC']],
      //         transaction: t,
      //         include: [
      //           {
      //             model: SupplierQuotes,
      //             where: {
      //               [Op.or]: [
      //                 {
      //                   is_paid: true,
      //                 },
      //                 {
      //                   [Op.and]: [
      //                     Sequelize.literal("(PurchaseRequests.status IN ('EXPIRED'))"),
      //                     {
      //                       is_paid: null,
      //                     },
      //                   ],
      //                 },
      //               ],
      //               supplier_info_uuid: entity_uuid,
      //             },
      //             attributes: ['charges_and_total', 'uuid'],
      //             include: [
      //               {
      //                 model: SupplierProductQuotes,
      //                 attributes: [
      //                   'other_brand_product_uuid',
      //                   'offered_price',
      //                   'offered_quantity',
      //                   'is_approved',
      //                   'purchase_request_products_uuid',
      //                 ],
      //                 include: [
      //                   {
      //                     model: Products,
      //                     attributes: ['uuid', 'name_en', 'category_uuid', 'measurement_uuid', 'name_ar', 'name_ur'],
      //                     include: [
      //                       {
      //                         model: Category,
      //                         attributes: ['name', 'uuid'],
      //                       },
      //                       {
      //                         model: Measurement,
      //                         attributes: ['unit_name'],
      //                       },
      //                     ],
      //                   },
      //                   {
      //                     model: PurchaseRequestProducts,
      //                     attributes: { exclude: ['description', 'created_at', 'updated_at', 'deleted_at'] },

      //                     include: [
      //                       {
      //                         model: Products,
      //                         attributes: [
      //                           'uuid',
      //                           'name_en',
      //                           'category_uuid',
      //                           'measurement_uuid',
      //                           'name_ar',
      //                           'name_ur',
      //                         ],
      //                         include: [
      //                           {
      //                             model: Category,
      //                             attributes: ['name', 'uuid'],
      //                           },
      //                           {
      //                             model: Measurement,
      //                             attributes: ['unit_name'],
      //                           },
      //                         ],
      //                       },
      //                     ],
      //                   },
      //                 ],
      //               },
      //             ],
      //           },
      //         ],
      //       }),
      //       this.purchaseRequestRepository.getAllData({
      //         where: {
      //           status: {
      //             [Op.in]: ['COMPLETED', 'EXPIRED'],
      //           },
      //           [Op.or]: [
      //             {
      //               supplier_info_uuid: entity_uuid,
      //             },
      //             {
      //               supplier_info_uuid: null,
      //             },
      //           ],
      //         },
      //         order: [['created_at', 'DESC']],
      //         transaction: t,
      //         include: [
      //           {
      //             model: PurchaseRequestProducts,
      //             attributes: ['uuid', 'product_uuid'],
      //             include: [
      //               {
      //                 model: Products,
      //                 attributes: ['uuid', 'name_en', 'category_uuid', 'measurement_uuid', 'name_ar', 'name_ur'],
      //                 include: [
      //                   {
      //                     model: Category,
      //                     attributes: ['name', 'uuid'],
      //                   },
      //                   {
      //                     model: Measurement,
      //                     attributes: ['unit_name'],
      //                   },
      //                 ],
      //               },
      //             ],
      //           },
      //         ],
      //       }),
      //     ]);
      //     withoutInclude.rows.forEach((item) => {
      //       const uuidExists = withInclude.rows.some((withItem) => withItem.uuid === item.uuid);
      //       if (!uuidExists) {
      //         withInclude.count++;
      //         const supplier_quote = item.PurchaseRequestProducts.map((purchaseRequestProduct) => {
      //           return {
      //             charges_and_total: '-',
      //             uuid: '-',
      //             supplier_product_quotes: [
      //               {
      //                 other_brand_product_uuid: '-',
      //                 offered_price: '-',
      //                 offered_quantity: '-',
      //                 is_approved: null,
      //                 purchase_request_products_uuid: '-',
      //                 otherBrandProduct: null,
      //                 ProductPurchaseRequests: purchaseRequestProduct,
      //               },
      //             ],
      //           };
      //         });

      //         const newRow = {
      //           uuid: item.uuid,
      //           requester_uuid: item.requester_uuid,
      //           store_info_uuid: item.store_info_uuid,
      //           supplier_info_uuid: item.supplier_info_uuid,
      //           quotes_accepted_upto: item.quotes_accepted_upto,
      //           status: item.status,
      //           total_price: item.total_price,
      //           created_at: item.created_at,
      //           deleted_at: item.deleted_at,
      //           supplier_quote: supplier_quote,
      //         };
      //         withInclude.rows.push(newRow as any);
      //       }
      //     });
      //     let offset = (+page - 1) * +limit;
      //     const total = [...withInclude.rows];
      //     total.sort((a, b) => {
      //       const dateA = new Date(a.created_at);
      //       const dateB = new Date(b.created_at);

      //       return dateB.getTime() - dateA.getTime();
      //     });

      //     const totalData = {
      //       count: withInclude.rows.length,
      //       rows: total.slice(Number(offset), Number(offset) + Number(limit)),
      //     };

      //     return generalResponse(
      //       res,
      //       { result: totalData, tab: selectedTab },
      //       PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
      //       responseType.SUCCESS,
      //       false,
      //       200,
      //     );
      //   });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getStorePurchaseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { apiParams, requester_uuid } = req.query as any;
      const { limit, page, searchText, sort, isAsc, extraParams } = apiParams;

      const { expiry_date, hasOffers }: PurchaseRequestExtraParams = extraParams || {};
      const [expiryDateFrom, expiryDateTo] = expiry_date || [];
      const formatedDateFrom = formatDateString(expiryDateFrom)?.slice(0, 10);
      const formatedDateTo = formatDateString(expiryDateTo)?.slice(0, 10);

      let order;
      if (sort) {
        if (sort === 'quotes_accepted_upto' || sort === 'status') {
          order = [[sort, isAsc === 'true' ? 'ASC' : 'DESC']];
        } else if (sort === 'requested_amount') {
          order = [['total_price', isAsc === 'true' ? 'ASC' : 'DESC']];
        }
      }
      const searchParams: PurchaseRequestSearchParams = {
        searchText: searchText || extraParams?.purchaseRequest_uuid || '',
        purchaseRequest_uuid: extraParams?.purchaseRequest_uuid,
      };

      const searchCriteria: any = {
        [Op.or]: [
          { uuid: { [Op.like]: `%${searchParams.searchText}%` } },
          { total_price: { [Op.like]: `%${searchParams.searchText}%` } },
        ],
      };

      const getStoreInfoUuid = await this.accountUserRepository.get({
        where: { user_uuid: requester_uuid },
        raw: true,
      });

      let purchaseRequestWhere: any = {
        store_info_uuid: getStoreInfoUuid.entity_uuid,
        status: extraParams?.status ? extraParams?.status:  { [Op.notIn]: ['BUY_NOW'] },
        ...searchCriteria,
      };

      if (expiry_date && hasOffers === 'YES') {
        purchaseRequestWhere = {
          ...purchaseRequestWhere,
          [Op.and]: [
            { status: { [Op.notIn]: ['BUY_NOW'] } },
            { status: 'QUOTED' },
            { quotes_accepted_upto: { [Op.gte]: formatedDateFrom, [Op.lte]: formatedDateTo } },
          ],
        };
      } else if (expiry_date) {
        purchaseRequestWhere.quotes_accepted_upto = { [Op.gte]: formatedDateFrom, [Op.lte]: formatedDateTo };
      } else if (hasOffers === 'YES') {
        purchaseRequestWhere = {
          ...purchaseRequestWhere,
          [Op.and]: [{ status: { [Op.notIn]: ['BUY_NOW'] } }, { status: 'QUOTED' }],
        };
      }

      const getRequests: PurchaseRequestResponse = await this.purchaseRequestRepository.getAllData({
        where: purchaseRequestWhere,
        limit: +limit,
        offset: (+page - 1) * +limit,
        attributes: ['total_price', 'quotes_accepted_upto', 'uuid', 'status'],
        order: order || [['created_at', 'DESC']],
      });

      const response = {
        ...getRequests,
        message: PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
        responseType: responseType.SUCCESS,
        success: true,
        statusCode: 200,
      };

      return generalResponse(res, response);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly purchaseReqExpired = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId } = req.body;
      const result = await db.transaction(async (t) => {
        const purchaseReq = await this.purchaseRequestRepository.getAll({
          where: { uuid: { [Op.in]: purchaseReqId } },
        });
        if (!purchaseReq) {
          return generalResponse(
            res,
            null,
            PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_STATUS_UPDATE_FAILED,
            responseType.FAILURE,
            true,
            200,
          );
        }
        await PurchaseRequests.update(
          {
            status: 'EXPIRED',
          },
          { where: { uuid: { [Op.in]: purchaseReqId } } },
        );
        const getStoreInfo = await PurchaseRequests.findOne({
          attributes: ['store_info_uuid'],
          where: {
            uuid: purchaseReqId,
          },
          raw: true,
        });
        for (const PurchaseRequest of purchaseReq) {
          if (PurchaseRequest.status !== 'EXPIRED') {
            await this.notificationRepository.NotificationCreateHandler({
              related_entity_id: PurchaseRequest.uuid,
              related_entity_type: LINK_TO_ENTITY_CONSTANT.PURCHASE_REQUEST,
              notification_type: PURCHASE_REQUEST_NOTIFICATIONS,
              notification_content: PURCHASE_REQUEST_NOTIFICATION_CONTENT.PURCHASE_REQUEST_EXPIRED,
              permission_name: 'Track Purchase Request',
              permission_owner: 'STORE',
              entity_info_uuid: getStoreInfo?.store_info_uuid,
            });
          }
        }
        return generalResponse(
          res,
          purchaseReq,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_STATUS_UPDATED,
          responseType.SUCCESS,
          true,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly purchaseReqCompleted = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId } = req.query;
      const purchaseReq = await this.purchaseRequestRepository.get({ where: { uuid: purchaseReqId as string } });
      if (!purchaseReq) {
        return generalResponse(
          res,
          '',
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_STATUS_UPDATE_FAILED,
          responseType.SUCCESS,
          true,
          200,
        );
      }
      const getSupplierQuotes = await SupplierQuotes.findAll({
        where: {
          purchase_request_uuid: purchaseReqId as string,
          is_paid: null,
        } as any,
        raw: true,
      });

      await this.purchaseRequestRepository.updateRequest({
        data: {
          status: 'COMPLETED',
          is_closed: true,
        },
        action: 'update',
        purchaseReq,
      });

      const result = await db.transaction(async (t) => {
        const Notification = await this.notificationRepository.createNotification(
          {
            data: {
              related_entity_type: 'PURCHASE_REQUEST',
              related_entity_id: purchaseReqId as string,
              content_en: PURCHASE_REQUEST_NOTIFICATIONS.PURCHASE_REQUEST_CLOSED_EN(purchaseReqId as string),
              content_ar: PURCHASE_REQUEST_NOTIFICATIONS.PURCHASE_REQUEST_CLOSED_AR(purchaseReqId as string),
              content_ur: PURCHASE_REQUEST_NOTIFICATIONS.PURCHASE_REQUEST_CLOSED_UR(purchaseReqId as string),
              link_to_entity: LINK_TO_ENTITY.PURCHASE_REQUEST_CLOSED(purchaseReqId as string),
            },
            action: 'create',
          },
          { transaction: t },
        );

        const getPermission = await Permissions.findOne({
          attributes: ['uuid'],
          where: {
            name: 'Manage Products Req.',
          },
          raw: true,
        });

        const suppId = getSupplierQuotes.map((item) => item.supplier_info_uuid);

        const getUsers = await this.accountUserRepository.getAllUserOfEntity(suppId, getPermission.uuid);

        const dataToCreate = [];
        getUsers &&
          Array.isArray(getUsers) &&
          getUsers.length > 0 &&
          getUsers.map((data) => {
            dataToCreate.push({
              notification_uuid: Notification.dataValues.uuid,
              receiver_uuid: data,
            });
          });

        await NotificationReciever.bulkCreate(dataToCreate, { transaction: t });
        await this.notificationReceiverRepository.Notificationbroadcaster(dataToCreate, getUsers, t);
      });

      return generalResponse(
        res,
        '',
        PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_STATUS_UPDATED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getpurchaseReq = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId } = req.query;
      const purchaseRequestReq = await this.purchaseRequestRepository.get({
        attributes: ['created_at', 'status', 'total_price', 'quotes_accepted_upto', 'uuid', 'is_closed'],
        where: {
          uuid: purchaseReqId as string,
        },
        include: [
          {
            model: SupplierQuotes,
            attributes: ['uuid', 'charges'],
          },
          {
            model: PurchaseRequestProducts,
            attributes: ['uuid'],
          },
        ],
      });
      return generalResponse(
        res,
        purchaseRequestReq,
        PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getpurchaseReqForStore = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId, store_info_uuid } = req.query;
      const purchaseRequestReq: any = await this.purchaseRequestRepository.getAll({
        include: [
          {
            model: PurchaseRequestProducts,
            order: [['created_at', 'DESC']],
            include: [
              {
                model: Products,
                include: [{ model: Measurement }],
                order: [['created_at', 'DESC']],
              },
            ],
          },
        ],
        order: [['created_at', 'DESC']],

        where: {
          uuid: purchaseReqId as string,
          store_info_uuid: store_info_uuid as string,
        },
      });

      if (purchaseRequestReq && Array.isArray(purchaseRequestReq) && purchaseRequestReq?.length > 0) {
        let defaultValue = {};
        let product_details = [];
        purchaseRequestReq?.forEach((item, index) => {
          defaultValue = {
            ['is_existing_req']: item?.dataValues?.supplier_info_uuid ? true : false,
            ['offer_for_entire_request']: item?.dataValues?.offer_for_entire_request,
            ['expiry_date']: item?.dataValues?.quotes_accepted_upto,
            ['address_uuid']: item?.dataValues?.address_uuid,
          };
          item?.dataValues?.PurchaseRequestProducts?.forEach((purchaseReqItem) => {
            product_details.push({
              uuid: purchaseReqItem?.uuid,
              category: purchaseReqItem?.category_uuid,
              product: purchaseReqItem.product_uuid,
              quantity: purchaseReqItem.requested_quantity,
              requested_price: purchaseReqItem?.requested_price,
              description: purchaseReqItem?.description,
              other_brands_allowed: purchaseReqItem?.dataValues?.allow_other_brands,
              unit_of_measurement: purchaseReqItem?.products?.dataValues?.measurement?.unit_name,
              subtotal: purchaseReqItem.requested_quantity * purchaseReqItem.requested_price,
              image: purchaseReqItem?.products?.featured_image,
            });
          });
        });

        let finalValue = {
          ...defaultValue,
          product_details,
        };
        return generalResponse(
          res,
          finalValue,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      } else {
        return generalResponse(
          res,
          null,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
          responseType.SUCCESS,
          true,
          200,
        );
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSinglePurchaseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchase_request_uuid } = req.params;
      const { supplier_uuid } = req.query;

      const getPurchaseRequest = await this.purchaseRequestRepository.get({
        attributes: ['quotes_accepted_upto', 'offer_for_entire_request', 'status','address_uuid','branch_uuid'],
        where: {
          uuid: purchase_request_uuid,
        },
        include:[
          {
            model:Branch,
          },
          {
            model:Address,
          }
        ]
      });
      if (getPurchaseRequest) {
        const getPurchaseRequestProducts = await PurchaseRequestProducts.findAndCountAll({
          attributes: { exclude: ['updated_at', 'deleted_at'] },
          where: {
            purchase_request_uuid: purchase_request_uuid,
          },
          include: [
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
              include: [
                {
                  model: Category,
                  attributes: ['name', 'uuid', 'name_ar', 'name_ur'],
                },
                {
                  model: Measurement,
                  attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
                },
              ],
            },
          ],
        });

        const getSupplierInfo = await AccountUsers.findOne({
          where: { user_uuid: supplier_uuid as string },
          raw: true,
        });

        const supplierQuotesData = await SupplierQuotes.findOne({
          where: {
            purchase_request_uuid: purchase_request_uuid,
            supplier_info_uuid: getSupplierInfo.entity_uuid,
          },
        });

        const singlePurchaseRequestData = [];
        let supplierProductQuoteData;
        if (supplierQuotesData) {
          supplierProductQuoteData = await this.supplierProductQuotesRepository.getAll({
            where: { supplier_quotes_uuid: supplierQuotesData?.uuid },
            attributes: ['offered_price', 'offered_quantity', 'uuid', 'purchase_request_products_uuid'],
            include: [
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
                include: [
                  {
                    model: Category,
                    attributes: ['name', 'uuid', 'name_ar', 'name_ur'],
                  },
                  {
                    model: Measurement,
                    attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
                  },
                ],
              },
            ],
          });
        }
        getPurchaseRequestProducts?.rows?.map((purchaseRequest) => {
          const matchingQuote = supplierProductQuoteData?.find(
            (quote) => quote.dataValues.purchase_request_products_uuid === purchaseRequest.dataValues.uuid,
          );
          let offered_price;
          let offered_quantity = matchingQuote
            ? matchingQuote.dataValues.offered_quantity
            : purchaseRequest.dataValues.requested_quantity;
          let otherBrandsProduct = null;
          let supplierProductQuoteUuid = null;

          if (matchingQuote) {
            offered_price = matchingQuote.dataValues.offered_price;
            otherBrandsProduct = matchingQuote.dataValues.otherBrandProduct
              ? {
                  value: matchingQuote.dataValues.otherBrandProduct?.uuid,
                  label_en: matchingQuote.dataValues.otherBrandProduct?.name_en,
                  label_ar: matchingQuote.dataValues.otherBrandProduct?.name_ar,
                  label_ur: matchingQuote.dataValues.otherBrandProduct?.name_ur,
                  featured_image: matchingQuote.dataValues.otherBrandProduct?.featured_image,
                }
              : null;
            supplierProductQuoteUuid = matchingQuote.dataValues.uuid;
          }

          singlePurchaseRequestData.push({
            purchase_request_product_uuid: purchaseRequest.dataValues.uuid,
            product_name: purchaseRequest.dataValues.products.name_en,
            product_name_ar: purchaseRequest.dataValues.products.name_ar,
            product_name_ur: purchaseRequest.dataValues.products.name_ur,
            image: purchaseRequest.dataValues.products.featured_image,
            quantity: offered_quantity,
            unit_of_measurement_en: purchaseRequest.dataValues.products.measurement.unit_name,
            unit_of_measurement_ur: purchaseRequest.dataValues.products.measurement.unit_name_ur,
            unit_of_measurement_ar: purchaseRequest.dataValues.products.measurement.unit_name_ar,
            requested_price: purchaseRequest.dataValues.requested_price,
            description: purchaseRequest.dataValues.description,
            offered_price,
            category_name: purchaseRequest.dataValues.products.category.name,
            category_name_ar: purchaseRequest.dataValues.products.category.name_ar,
            category_name_ur: purchaseRequest.dataValues.products.category.name_ur,

            category_uuid: purchaseRequest.dataValues.products.category.uuid,
            allow_other_brands: purchaseRequest.dataValues.allow_other_brands,
            otherBrandsProduct,
            supplierProductQuoteUuid,
          });
        });

        const finalResponse = {
          product_details: singlePurchaseRequestData,
          supplierQuoteUuid: supplierQuotesData && supplierQuotesData.dataValues.uuid,
          quotes_accepted_upto: getPurchaseRequest.dataValues.quotes_accepted_upto,
          offer_for_entire_request: getPurchaseRequest.dataValues.offer_for_entire_request,
          charges_and_total: supplierQuotesData && supplierQuotesData.dataValues.charges_and_total,
          status: getPurchaseRequest.dataValues.status,
          isPaid: supplierQuotesData && supplierQuotesData.dataValues.is_paid,
          shipping_info: getPurchaseRequest?.address_info,
        };
        return generalResponse(
          res,
          finalResponse,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
          responseType.SUCCESS,
          false,
          200,
        );
      } else {
        return generalResponse(
          res,
          null,
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
          responseType.SUCCESS,
          false,
          200,
        );
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deletePurchaseRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchaseReqId } = req.params;
      const getPurchaseReq = await this.purchaseRequestRepository.get({
        where: {
          uuid: purchaseReqId as string,
        },
      });
      if (!getPurchaseReq) {
        return generalResponse(
          res,
          '',
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_NOT_FOUND,
          responseType.SUCCESS,
          false,
          200,
        );
      }
      await db.transaction(async (t) => {
        await this.purchaseRequestRepository.deleteData({
          where: {
            uuid: purchaseReqId as string,
          },
        });
        await this.purchaseRequestProductsRepository.deleteData({
          where: {
            purchase_request_uuid: purchaseReqId as string,
          },
        });
        const getSupplierQuoteUuid = await this.supplerQuotesRepository.get({
          where: {
            purchase_request_uuid: purchaseReqId as string,
          },
          attributes: ['uuid'],
        });
        await this.supplerQuotesRepository.deleteData({
          where: {
            purchase_request_uuid: purchaseReqId as string,
          },
        });

        if (getSupplierQuoteUuid) {
          await this.supplierProductQuotesRepository.deleteData({
            where: {
              supplier_quotes_uuid: getSupplierQuoteUuid.dataValues.uuid,
            },
          });
        }

        const getNotificationIds = await this.notificationRepository.getAll({
          where: { related_entity_id: purchaseReqId },
          attributes: ['uuid'],
        });

        await this.notificationRepository.deleteData({
          where: {
            related_entity_id: purchaseReqId,
          },
        });

        if (getNotificationIds) {
          await this.notificationReceiverRepository.deleteData({
            where: {
              notification_uuid: { [Op.in]: getNotificationIds.map((data) => data.dataValues.uuid) },
            },
          });
        }

        return generalResponse(
          res,
          '',
          PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_DELETED,
          responseType.SUCCESS,
          false,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly directBuyNow = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplier_uuid, store_info_uuid, end_date, price, requester_uuid, product_uuid, quantity } = req.body;
      const getSupplierInfo = await this.accountUserRepository.get({
        where: { user_uuid: supplier_uuid },
        raw: true,
      });
      const findSupplierProduct = await SupplierProducts.findOne({
        where: {
          product_uuid: product_uuid,
          supplier_info_uuid: getSupplierInfo.entity_uuid,
        },
      });
      const getVatCharges = await AdminSettings.findOne({
        where:{
          current_active:true
        }
      });
      const request_expiry = end_date;
      const formattedDate = moment(request_expiry).format('YYYY-MM-DD HH:mm:ss');
      const supplier_info_id = getSupplierInfo?.entity_uuid;
      const total_price = price;

      let purchaseReq;
      await db.transaction(async (t) => {
        purchaseReq = await this.purchaseRequestRepository.createRequest(
          {
            data: {
              requester_uuid: requester_uuid,
              quotes_accepted_upto: formattedDate,
              supplier_info_uuid: supplier_info_id,
              store_info_uuid: store_info_uuid,
              status: 'BUY_NOW',
              total_price: total_price,
              quantity: quantity,
              is_closed: true,
            },
            action: 'create',
          },
          { transaction: t },
        );
        const amount_without_vat = Number(total_price * quantity);
        const orderId = await Orders.create(
          {
            purchase_request_id: purchaseReq?.dataValues?.uuid,
            store_info_uuid: store_info_uuid,
            supplier_info_uuid: supplier_info_id,
            created_by: requester_uuid,
            status: 'PENDING',
            vat_percentage: getVatCharges.dataValues.vat_percentage as number,
            amount_without_vat: amount_without_vat + findSupplierProduct.charges,
          },
          { transaction: t },
        );
        await OrderProducts.create(
          {
            order_id: orderId?.dataValues?.uuid,
            price: total_price,
            quantity: quantity,
            product_uuid: product_uuid,
          },
          { transaction: t },
        );
      });
      return generalResponse(
        res,
        purchaseReq,
        PURCHASE_REQUEST_MESSAGES.PURCHASE_REQUEST_FETCHED,
        responseType.SUCCESS,
        false,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

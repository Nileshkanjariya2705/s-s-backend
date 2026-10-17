import { generalResponse, responseType, statusType } from '@/helper/common.helper';
import { LINK_TO_ENTITY, PURCHASE_REQUEST_NOTIFICATIONS } from '@/messages/notificationMessages';
import { SUPPLIER_PRODUCT_QUOTES_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountUsers from '@/models/accountUsers.model';
import NotificationReciever from '@/models/notificationReciever.model';
import Permissions from '@/models/permissions.model';
import Products from '@/models/products.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import SupplierQuotes from '@/models/supplierQuotes.model';
import User from '@/models/user.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import ProductsRepo from '@/repository/Products/products.repository';
import PurchaseRequestProductsRepo from '@/repository/PurchaseRequestProducts/purchaseRequestProducts.repository';
import SupplierProductQuotesRepo from '@/repository/SupplierProductQuotes/supplierProductQuotes.repository';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';

export class SupplierProductQuotesController {
  constructor(
    private readonly supplierProductQuotesRepository: SupplierProductQuotesRepo,
    private readonly SupplierQuoteRepository: SupplierQuotesRepo,
    private readonly purchaseRequestProductRepository: PurchaseRequestProductsRepo,
    private readonly productRepository: ProductsRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationRecieverRepository: NotificationRecieverRepo,
    private readonly accountUserRepository: AccountUsersRepo,
  ) {}

  public readonly supplierProductQuotesCreate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchase_request_uuid, quoted_by, charges, product_details } = req.body;
      const genrateToTalQuoationsAmount = product_details.reduce((accumulator, product) => {
        const quantity = product.quantity;
        const offered_price = product.offered_price;
        const totalPrice = Number(quantity) * Number(offered_price);
        return accumulator + totalPrice;
      }, 0);
      const getSupplierInfo = await AccountUsers.findOne({
        where: { user_uuid: quoted_by },
        attributes: ['entity_uuid'],
      });
      await db.transaction(async (t) => {
        await PurchaseRequests.update(
          {
            status: 'QUOTED',
          },
          {
            where: {
              uuid: purchase_request_uuid,
            },
          },
        );
        const supplier_quote = await this.SupplierQuoteRepository.createSupplierQuote(
          {
            data: {
              purchase_request_uuid: purchase_request_uuid,
              supplier_info_uuid: getSupplierInfo.entity_uuid,
              quoted_by: quoted_by,
              charges: charges === null ? 0 : charges,
              charges_and_total: genrateToTalQuoationsAmount + charges,
            },
            action: 'create',
          },
          { transaction: t },
        );
        const bulkData = product_details?.map((item) => {
          return {
            purchase_request_products_uuid: item?.purchase_request_products_uuid,
            offered_price: item?.offered_price,
            offered_quantity: item?.quantity,
            other_brand_product_uuid: item?.other_brand_product_uuid,
            supplier_quotes_uuid: supplier_quote?.dataValues?.uuid,
          };
        });

        await this.supplierProductQuotesRepository.bulkCreate(bulkData, { transaction: t });
        const Notification = await this.notificationRepository.createNotification(
          {
            data: {
              related_entity_type: 'PURCHASE_REQUEST',
              related_entity_id: purchase_request_uuid,
              content_en: PURCHASE_REQUEST_NOTIFICATIONS.PURCHASE_REQUEST_QUOTED_EN(
                purchase_request_uuid,
                getSupplierInfo.entity_uuid,
              ),
              content_ar: PURCHASE_REQUEST_NOTIFICATIONS.PURCHASE_REQUEST_QUOTED_AR(
                purchase_request_uuid,
                getSupplierInfo.entity_uuid,
              ),
              content_ur: PURCHASE_REQUEST_NOTIFICATIONS.PURCHASE_REQUEST_QUOTED_UR(
                purchase_request_uuid,
                getSupplierInfo.entity_uuid,
              ),
              link_to_entity: LINK_TO_ENTITY.PURCHASE_REQUEST(purchase_request_uuid),
            },
            action: 'create',
          },
          { transaction: t },
        );
        const getStoreInfo = await PurchaseRequests.findOne({
          attributes: ['store_info_uuid'],
          where: {
            uuid: purchase_request_uuid,
          },
          raw: true,
        });
        const getPermission = await Permissions.findOne({
          attributes: ['uuid'],
          where: {
            name: 'Track Purchase Request',
            permission_owner: 'STORE',
          },
          raw: true,
        });
        const getUsers = await this.accountUserRepository.getAllUserOfEntity(
          getStoreInfo.store_info_uuid,
          getPermission.uuid,
        );

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
        await this.notificationRecieverRepository.Notificationbroadcaster(dataToCreate, getUsers, t);
      });

      return generalResponse(
        res,
        null,
        SUPPLIER_PRODUCT_QUOTES_MESSAGES.QUOTES_CREATED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getCategoryWiseProduct = async (req: Request, res: Response) => {
    try {
      const { category_uuid, purchase_request_product_uuid, language } = req.query;
      const getProductUuid = await this.purchaseRequestProductRepository.get({
        where: {
          uuid: purchase_request_product_uuid as string,
        },
        attributes: ['uuid'],
        include: [
          {
            model: Products,
            attributes: ['uuid'],
          },
        ],
      });
      const productList = await this.productRepository.getAll({
        attributes: [`name_en`, 'name_ur', 'name_ar', 'uuid', 'featured_image'],
        where: {
          category_uuid: category_uuid as string,
          uuid: {
            [Op.ne]: getProductUuid.products.uuid as string,
          },
          status: statusType.ACTIVE,
        },
      });
      return generalResponse(
        res,
        productList,
        SUPPLIER_PRODUCT_QUOTES_MESSAGES.PRODUCTS_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateOtherBrandProduct = async (req: Request, res: Response) => {
    try {
      const { purchase_request_product_uuid, supplier_uuid } = req.body;

      const getSupplierInfo = await AccountUsers.findOne({
        where: { user_uuid: supplier_uuid as string },
        attributes: ['entity_uuid'],
        raw: true,
      });

      const getSupplierQuote = await this.SupplierQuoteRepository.get({
        where: { supplier_info_uuid: getSupplierInfo.entity_uuid },
        attributes: ['uuid'],
        raw: true,
      });

      if (getSupplierQuote) {
        const updateOtherBrandProductData = await SupplierProductQuotes.update(
          { ...req.body },
          {
            where: {
              purchase_request_products_uuid: purchase_request_product_uuid,
              supplier_quotes_uuid: getSupplierQuote.uuid,
            },
          },
        );
      }

      return generalResponse(
        res,
        null,
        SUPPLIER_PRODUCT_QUOTES_MESSAGES.QUOTES_CREATED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly supplierProductQuotesUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplier_quote_uuid, product_details ,charges} = req.body;
      const getSupplierQuote = await this.SupplierQuoteRepository.get({
        where: {
          uuid: supplier_quote_uuid,
        },
      });

      if (!getSupplierQuote) {
        return generalResponse(
          res,
          null,
          SUPPLIER_PRODUCT_QUOTES_MESSAGES.QUOTE_DOES_NOT_FOUND,
          responseType.SUCCESS,
          true,
          200,
        );
      }
      await db.transaction(async (t) => {
        const data = await SupplierQuotes.update(
          {
            charges_and_total: product_details.length > 0 && product_details.reduce((acc, item) =>{
              const price = parseFloat(item.offered_price);
              const quantity = parseFloat(item.quantity);
              const itemCost = price * quantity;
              return acc + itemCost;
            },0) + parseFloat(charges),
          },
          {
            where: {
              uuid: supplier_quote_uuid,
            },
            transaction: t,
          },
        );

        // const quotesToUpdate = product_details?.map((item) => {
        //   return {
        //     offered_price: item.offered_price,
        //     offered_quantity: item.quantity,
        //     quote_uuid: item.supplier_product_quote_uuid,
        //     other_brand_product_uuid: item.other_brand_product_uuid ? item.other_brand_product_uuid : null,
        //   };
        // });\\

        for (const item of product_details) {
          if (item.supplier_product_quote_uuid === null && item.offered_price) {
            const newData = await SupplierProductQuotes.create(
              {
                purchase_request_products_uuid: item.purchase_request_products_uuid,
                offered_price: item.offered_price,
                offered_quantity: item.quantity,
                other_brand_product_uuid: item.other_brand_product_uuid || null,
                supplier_quotes_uuid: supplier_quote_uuid,
              },
              { transaction: t },
            );
          } else {
            const update = await SupplierProductQuotes.update(
              {
                offered_price: item.offered_price ? item.offered_price : null,
                offered_quantity: item.quantity,
                other_brand_product_uuid: item.other_brand_product_uuid || null,
              },
              {
                where: {
                  uuid: item.supplier_product_quote_uuid,
                },
                transaction: t,
              },
            );
          }
        }
      });

      // for (const update_data of quotesToUpdate) {
      //   await SupplierProductQuotes.update(
      //     {
      //       offered_price: update_data.offered_price,
      //       offered_quantity: update_data.offered_quantity,
      //       other_brand_product_uuid: update_data.other_brand_product_uuid,
      //     },
      //     {
      //       where: {
      //         uuid: update_data.quote_uuid,
      //       },
      //       transaction: t,
      //     },
      //   );
      // }
      // });
      return generalResponse(
        res,
        null,
        SUPPLIER_PRODUCT_QUOTES_MESSAGES.QUOTES_UPDATED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

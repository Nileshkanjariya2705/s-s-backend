import { generalResponse, responseType } from '@/helper/common.helper';
import { ORDER_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import Category from '@/models/category.model';
import Measurement from '@/models/measurement.model';

import Products from '@/models/products.model';
import PurchaseRequests from '@/models/purchaseRequest.model';
import PurchaseRequestProducts from '@/models/purchaseRequestsProduct.model';
import SupplierProductQuotes from '@/models/supplierProductQuotes.model';
import SupplierProducts from '@/models/supplierProducts.model';
import SupplierQuotes from '@/models/supplierQuotes.model';
import OrderProductsRepo from '@/repository/OrderProducts/orderProducts.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import { NextFunction, Request, Response } from 'express';

export class OrderProductController {
  constructor(
    private readonly orderRepository: OrderRepo,
    private readonly orderProductRepository: OrderProductsRepo,
  ) {}

  public readonly getParticularOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { purchase_request_id, user_entity_uuid, supplier_info_uuid } = req.query;

      const findPurchaseReq = await PurchaseRequests.findOne({
        where: { uuid: purchase_request_id as string },
      });
      if (findPurchaseReq.status !=="BUY_NOW")  {
        const getOrderId = await this.orderRepository.get({
          where: {
            purchase_request_id: purchase_request_id as string,
            store_info_uuid: user_entity_uuid as string,
            supplier_info_uuid: supplier_info_uuid as string,
          },
          attributes: ['uuid', 'status', 'address_id'],
          raw: true,
        });

        const getOrderProducts = await this.orderProductRepository.getAll({
          where: { order_id: getOrderId?.uuid },
          include: [
            {
              model: SupplierProductQuotes,
              attributes: [
                'other_brand_product_uuid',
                'offered_price',
                'offered_quantity',
                'is_approved',
                'purchase_request_products_uuid',
              ],
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
                      attributes: ['name', 'name_ur', 'name_ar', 'uuid'],
                    },
                    {
                      model: Measurement,
                      attributes: ['unit_name', 'unit_name_ar', 'unit_name_ur'],
                    },
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
                        'name_ur',
                        'name_ar',
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
                {
                  model: SupplierQuotes,
                  attributes: ['charges_and_total', 'charges'],
                },
              ],
            },
          ],
        });
        const finalResponse = {
          data: getOrderProducts,
          address_uuid: getOrderId?.address_id ? getOrderId?.address_id : findPurchaseReq.address_uuid,
          order_status: getOrderId?.status,
        };
        return generalResponse(res, finalResponse, ORDER_MESSAGES.ORDER_CREATED, responseType.SUCCESS, true, 200);
      } else {
        const order = await this.orderRepository.get({
          where: { purchase_request_id: findPurchaseReq?.uuid },
        });
        const orderProd: any = await this.orderProductRepository.get({
          where: { order_id: order?.dataValues?.uuid },
        });
        const product = await Products.findOne({
          where: { uuid: orderProd?.dataValues?.product_uuid },
          attributes: ['name_en', 'name_ar', 'featured_image', 'uuid'],
          include: [
            {
              model: Category,
              attributes: ['name', 'uuid'],
            },
            {
              model: Measurement,
              attributes: ['unit_short_name'],
            },
          ],
        });
        const charges = await SupplierProducts.findOne({
          where: {
            uuid: req.query.supplierProdId as string,
          },
          attributes: ['charges'],
        });

        let finalRes = [
          {
            ...orderProd?.dataValues,
            uuid: orderProd?.dataValues?.uuid,
            order_id: order?.dataValues?.uuid,
            address_uuid: order?.dataValues.address_id ? order.dataValues.address_id : null,
            order_status: order?.dataValues?.status,
            buy_now: findPurchaseReq?.status,
            supplierProductQuotes: {
              ProductPurchaseRequests: { products: product },
              SupplierQuotes: { charges: charges.dataValues.charges },
            },
          },
        ];
        return generalResponse(res, finalRes, ORDER_MESSAGES.ORDER_CREATED, responseType.SUCCESS, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly orderProductUpdate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      for (const data of req.body) {
        const orderProduct = await this.orderProductRepository.get({
          where: { uuid: data.uuid },
        });
        await this.orderProductRepository.updateOrderProduct({
          data: {
            quantity: data.quantity,
          },
          action: 'update',
          orderProduct,
        });
      }
      return generalResponse(res, null, ORDER_MESSAGES.ORDER_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteOrderProduct = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { orderProductId } = req.params;
      const orderProduct = await this.orderProductRepository.get({
        where: { uuid: orderProductId },
      });

      if (orderProduct) {
        await this.orderProductRepository.deleteData({
          where: {
            uuid: orderProductId,
          },
        });
        return generalResponse(res, null, ORDER_MESSAGES.ORDER_DELETED, responseType.SUCCESS, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateReqStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.params;
      const { status } = req.body;
      const updateStatus = await this.orderProductRepository.update({
        replacement_request: status,
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import BaseRepository from '../base.repository';
import Orders from '@/models/orders.model';
import { BuildOrderRequestArgs } from '@/interfaces/Order/orders.interface';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import PaymentDetail from '@/models/paymentDetails.model';
import sequelize, { Op } from 'sequelize';
import SupplierInfo from '@/models/supplierinfo.model';
import OrderProducts from '@/models/orderProduct.model';
import RefundOrders from '@/models/refundOrders.model';
import OrderReplacementRequests from '@/models/orderReplacement';
import RefundOrderProducts from '@/models/refundOrderProducts.model';
import OrderProductsReplaceRequest from '@/models/orderProductsReplaceRequest.model';
import moment from 'moment';

export default class OrderRepo extends BaseRepository<Orders> {
  constructor() {
    super(Orders.name);
  }

  readonly createOrderRequest = async (orders: BuildOrderRequestArgs, extraParam: { transaction }) => {
    const { data } = orders;
    const { transaction } = extraParam;

    const order = await this.create(
      {
        ...data,
      },
      { transaction },
    );

    return order;
  };

  readonly updateOrder = async (orders: Required<BuildOrderRequestArgs>) => {
    const { data, orderData } = orders;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, orderData);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };

  readonly getOrderSupplierWise = async ({
    supplier_info_uuid,
    month,
    year,
  }: {
    supplier_info_uuid: string;
    month: number;
    year: number;
  }) => {
    const targetMonth = month;
    const targetYear = year;

    const startDate = moment().year(targetYear).month(targetMonth).startOf('month');
    const endDate = moment().year(targetYear).month(targetMonth).endOf('month');
    return db.transaction(async (transaction) => {
      const orders = await this.getAllData({
        attributes: ['uuid','refund_accepted_admin'],
        where: {
          supplier_info_uuid: supplier_info_uuid,
        },
        transaction: transaction,
      });
      const orderSupplierInfo = await this.getAllData({
        include: [
          {
            model: SupplierInfo,
            attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
          },
          {
            model: PaymentDetail,
            attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
            where: {
              order_id: {
                [Op.in]: orders.rows.map((order) => order.uuid),
              },
              payment_status: 'SUCCESS',
            },
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
        where: {
          supplier_info_uuid: supplier_info_uuid,
          created_at: {
            [Op.between]: [startDate.toDate(), endDate.toDate()],
          },
        },
      });

      const totalAmount: number = Number(
        orderSupplierInfo.rows
          .reduce((total, order) => {
            return (
              total +
              order.PaymentDetail.reduce((subTotal: number, paymentDetail: { amount: number }) => {
                return subTotal + paymentDetail.amount;
              }, 0)
            );
          }, 0)
          .toFixed(2),
      );
      const orderCountRefunfedByAdmin =  orderSupplierInfo.rows.filter((order) => order.refund_accepted_admin === true).length
      return { orderSupplierInfo, amountToPaySupplier: totalAmount, total: orderSupplierInfo.count,OrderCountRefunfedByAdmin:orderCountRefunfedByAdmin };
    });
  };
}

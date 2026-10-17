import AccountUsers from '@/models/accountUsers.model';
import Address from '@/models/address.model';
import OrderProducts from '@/models/orderProduct.model';
import OrderProductsReplaceRequest from '@/models/orderProductsReplaceRequest.model';
import OrderReplacementRequests from '@/models/orderReplacement';
import Orders from '@/models/orders.model';
import PaymentDetail from '@/models/paymentDetails.model';
import RefundOrderProducts from '@/models/refundOrderProducts.model';
import RefundOrders from '@/models/refundOrders.model';
import SupplierAdminReports from '@/models/supplierAdminReports';
import SupplierInfo from '@/models/supplierinfo.model';
import User from '@/models/user.model';
import { generatePDFReport, genrateEXEReport } from '@/utils/util';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';
export const generateStatistic = async () => {
  try {
    const getAllSuppliers = await AccountUsers.findAll({
      attributes: ['entity_uuid'],
      where: {
        entity_type: 'SUPPLIER',
      },
      include: [
        {
          model: User,
          include: [
            {
              model: Address,
              attributes: ['city', 'state', 'country', 'postal_code', 'phone', 'uuid', 'is_default'],
            },
          ],
          attributes: ['username', 'email', 'phone', 'image'],
        },
      ],
    });
    const currentMonth = moment().month();
    const currentYear = moment().year();
    const currentDay = moment().day();
    let getAllOrders = await SupplierInfo.findAndCountAll({
      include: [
        {
          model: Orders,
          required: false,
          where: {
            supplier_info_uuid: {
              [Op.in]: getAllSuppliers.map((supplier) => supplier.entity_uuid),
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
    //to add the suppliers shop address
    getAllSuppliers.forEach((currentSupplier) => {
      getAllOrders.rows.forEach((item) => {
        if (item.uuid === currentSupplier.entity_uuid) {
          const address = currentSupplier.user.address;
          const supplierAddress = address.address
            ? `${address.address} ${address.city} ${address.country} ${address.postal_code}`
            : '(No address found please add address)';
          item.address = supplierAddress;
        }
      });
    });
    // Generate PDF reports for each supplier and store them in the database
    await Promise.all(
      getAllOrders.rows.map(async (row: any) => {
        const report = await SupplierAdminReports.create({
          month: currentMonth,
          year: currentYear,
          supplier_info_uuid: row.uuid,
          file: null,
          status: 'PENDING',
          sheets: null,
        });
        const fileName = await generatePDFReport(row.uuid, row, report, currentMonth, currentYear);
        const sheetName = await genrateEXEReport(row.uuid, row, report, currentMonth, currentYear);
        await SupplierAdminReports.update(
          {
            file: fileName,
            sheets: sheetName,
          },
          {
            where: {
              uuid: report.uuid,
            },
          },
        );
      }),
    );

    return getAllOrders;
  } catch (error) {
    console.log('🚀 ~ generateStatistic ~ error:', error);
    throw new Error(error.message);
  }
};

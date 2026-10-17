// =================== import packages ====================
import _ from 'lodash';
import axios from 'axios';

// import puppeteer from 'puppeteer-extra';
const PuppeteerHTMLPDF = require('puppeteer-html-pdf');

import path from 'path';

const excelJS = require('exceljs');
import fs from 'fs/promises';
import ejs from 'ejs';
import { orderDetail, orderSupplierInfo } from '@/jobs/types/job.types';
import moment from 'moment';
import { GOOGLE_RECAPTCHA_API_KEY } from '@/config';
import { folderHandler } from './general';

const compile = async function (templateName, data) {
  try {
    const filePath = path.join(__dirname, `../templates/${templateName}.ejs`);
    const template = await fs.readFile(filePath, 'utf8');
    return ejs.render(template, data);
  } catch (error) {
    throw error;
  }
};
function calculateTotalOrderAmount(orders, filterCondition) {
  return orders.Orders.filter((order) => filterCondition(order)).reduce((acc, order) => {
    return acc + Number(order.PaymentDetail.map((item) => item.amount).reduce((sum, amount) => sum + amount, 0));
  }, 0);
}
export const isNumberValue = (text: string) => {
  return text && !_.isNaN(+text) && Number.isFinite(+text);
};

export const hasOwnProperty = (obj: Object, key: string) => {
  return Object.prototype.hasOwnProperty.call(obj, key);
};

export const checkGoogleReCaptchaVerification = async (token: string) => {
  if (!GOOGLE_RECAPTCHA_API_KEY) {
    return true;
  }
  if (!token) {
    return false;
  }
  const url = `https://www.google.com/recaptcha/api/siteverify?secret=${GOOGLE_RECAPTCHA_API_KEY}&response=${token}`;

  const res: any = await axios.post(url);
  if (res.data && res.data?.success) {
    return true;
  } else return false;
};

export const calculateTotalRefundableAmount = (refundable_amount_without_vat: number, vat_percentage: number) => {
  const vat_amount = refundable_amount_without_vat * (vat_percentage / 100);

  const total_refundable_amount = refundable_amount_without_vat + vat_amount;

  return total_refundable_amount;
};
function calculatePercentage(amount, percentage) {
  const decimalPercentage = parseFloat(percentage) / 100;
  const result = parseFloat(amount) * decimalPercentage;
  return result;
}

export const generatePDFReport = async (
  supplierUUID: string,
  orders: orderSupplierInfo,
  report,
  currentMonth: number,
  currentYear: number,
) => {
  try {
    const total_success_orders_amount = calculateTotalOrderAmount(
      orders,
      (orders: orderDetail) => orders.reason_for_cancel === null,
    );
    const supplier_report_data = {
      canceled_orders_count: orders.Orders.filter((order) => order.reason_for_cancel !== null).length,
      total_success_orders_count: orders.Orders.filter((order) => order.reason_for_cancel === null).length,
      total_success_orders_amount,
      total_canceled_orders_amount: calculateTotalOrderAmount(
        orders,
        (orders: orderDetail) => orders.reason_for_cancel !== null,
      ),
      total_amount_without_vat:
        total_success_orders_amount -
        orders.Orders.reduce((acc, order) => {
          return acc + order?.amount_without_vat;
        }, 0),

      sales_commission_percent: orders.Ord_Commission,
      sales_commission_amount: calculatePercentage(total_success_orders_amount, orders.Ord_Commission).toFixed(2),
      bank_commission_percent: orders.Bank_Commission,
      bank_commission_amount: calculatePercentage(total_success_orders_amount, orders.Bank_Commission).toFixed(2),
      total_invoice_amount: (
        calculatePercentage(total_success_orders_amount, orders.Ord_Commission) +
        calculatePercentage(total_success_orders_amount, orders.Bank_Commission)
      ).toFixed(2),
      admin_refunded_amount: orders.Orders.filter((order) => order.refund_accepted_admin)
        .reduce((acc, order) => {
          return (
            acc +
            Number(order.RefundOrders.map((item) => item.refundable_amount).reduce((sum, amount) => sum + amount, 0))
          );
        }, 0)
        .toFixed(2),
    };
    const htmlPDF = new PuppeteerHTMLPDF();
    htmlPDF.setOptions({ format: 'A4', margin: { top: '20px', right: '50px', bottom: '20px', left: '50px' } });
    const content = await compile('supplierReport', { orders, report, ...supplier_report_data });
    const pdfBuffer = await htmlPDF.create(content);
    folderHandler(path.join(__dirname, '../../public/pdf'))
    const filePath = path.join(
      __dirname,
      `../../public/pdf/${currentYear}-${currentMonth}_supplier_${supplierUUID}_report.pdf`,
    );
    await htmlPDF.writeFile(pdfBuffer, filePath);
    return `${currentYear}-${currentMonth}_supplier_${supplierUUID}_report.pdf`;
  } catch (error) {
    console.log('🚀 ~ generatePDFReport ~ error:', error);
  }
};

export const genrateEXEReport = async (
  supplierUUID: string,
  orders: orderSupplierInfo,
  report,
  currentMonth: number,
  currentYear: number,
) => {
  const workbook = new excelJS.Workbook();
  const worksheet = workbook.addWorksheet('My Users', {
    headerFooter: { firstHeader: `Monthly Summary for ${currentMonth}/${currentYear}`, firstFooter: 'Hello World' },
  });
  folderHandler( path.join(__dirname, '../../public/sheets'))
  const distPath = path.join(__dirname, '../../public/sheets');
  workbook.created = new Date();
  workbook.lastPrinted = new Date();
  worksheet.columns = [
    { header: 'Sr No', key: 'sr_no', width: 10, font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } },
    {
      header: 'Order ID',
      key: 'order_id',
      width: 20,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Payment Status',
      key: 'payment_status',
      width: 20,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    { header: 'Status', key: 'status', width: 20, font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } },
    {
      header: 'Company Name',
      key: 'company_name',
      width: 50,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Total number of products',
      key: 'no_of_prds',
      width: 20,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Delivery Provider',
      key: 'delivery_provider',
      width: 20,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    { header: 'Amount', key: 'amount', width: 10, font: { bold: true, size: 16 }, alignment: { horizontal: 'center' } },
    {
      header: 'Delivery Fee',
      key: 'delivery_fee',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Commissionable GMV (VAT Excluded)',
      key: 'commissionable_gmv',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Ord Discount',
      key: 'ord_discount',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'VAT percentage',
      key: 'vat_percentage',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'ORD Commission Percentage',
      key: 'ord_commission_percentage',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'ORD Commission Amount',
      key: 'ord_commission_amount',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Bank Commission Percentage',
      key: 'bank_commission_percentage',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Bank Commission Amount',
      key: 'bank_commission_amount',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Commission',
      key: 'commission',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Payment Type',
      key: 'payment_type',
      width: 20,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'CC Amount',
      key: 'cc_amount',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'CC Refund Amount',
      key: 'cc_refund_amount',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Creation Time',
      key: 'creation_time',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
    {
      header: 'Operation Day',
      key: 'operation_day',
      width: 30,
      font: { bold: true, size: 16 },
      alignment: { horizontal: 'center' },
    },
  ];
  let counter = 1;
  orders.Orders.forEach((singleOrder) => {
    if (counter == 1) {
      worksheet.addRow();
    }
    const row = worksheet.addRow({
      sr_no: counter,
      order_id: singleOrder.uuid.slice(0, 8),
      payment_status: 'Paid',
      status: singleOrder.status,
      company_name: orders.company_name,
      no_of_prds: singleOrder.OrderProducts.length,
      delivery_provider: 'Supplier',
      amount: singleOrder?.PaymentDetail[0]?.amount,
      delivery_fee: 0,
      commissionable_gmv: singleOrder.amount_without_vat,
      ord_discount: 0,
      vat_percentage: singleOrder.vat_percentage + '%',
      cc_amount: singleOrder?.PaymentDetail[0]?.amount,
      payment_type: singleOrder.PaymentDetail[0].payment_method_type || 'BANK TRANSFER',
      cc_refund_amount: singleOrder.refund_accepted_admin ? singleOrder.RefundOrders[0].refundable_amount : 0,
      creation_time: moment(singleOrder.created_at).format('YYYY-MM-DD HH:mm:ss'),
      operation_day: moment(singleOrder.created_at).format('YYYY-MM-DD'),
      ord_commission_percentage: orders.Ord_Commission + '%',
      ord_commission_amount: parseFloat(
        calculatePercentage(singleOrder?.PaymentDetail[0]?.amount, orders.Ord_Commission).toFixed(2),
      ),
      bank_commission_percentage: orders.Bank_Commission + '%',
      bank_commission_amount: parseFloat(
        calculatePercentage(singleOrder?.PaymentDetail[0]?.amount, orders.Bank_Commission).toFixed(2),
      ),
      commission:
        parseFloat(calculatePercentage(singleOrder?.PaymentDetail[0]?.amount, orders.Bank_Commission).toFixed(2)) +
        parseFloat(calculatePercentage(singleOrder?.PaymentDetail[0]?.amount, orders.Ord_Commission).toFixed(2)),
    });
    counter++;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: 'center' };
    });
  });
  if (orders.Orders.length === 0) {
    worksheet.mergeCells('A4:V4');
    const row = worksheet.getRow(4);
    row.getCell(1).value = 'No records found';
    row.getCell(1).font = { size: 38 };
    row.height = 50;
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  }
  const amountColumn = worksheet.getColumn('amount');

  let lastRowIndex = 1;
  amountColumn.eachCell({ includeEmpty: false }, (cell, rowNumber) => {
    lastRowIndex = rowNumber;
  });
  const totalAmountCell = worksheet.getCell(`H${lastRowIndex + 2}`);
  totalAmountCell.value = { formula: `SUM(H2:H${lastRowIndex})` };

  const totalOrdCommisionAmountCell = worksheet.getCell(`N${lastRowIndex + 2}`);
  totalOrdCommisionAmountCell.value = { formula: `SUM(N2:N${lastRowIndex})` };

  const totalBankCommisionAmountCell = worksheet.getCell(`P${lastRowIndex + 2}`);
  totalBankCommisionAmountCell.value = { formula: `SUM(P2:P${lastRowIndex})` };

  const totalCommisionAmountCell = worksheet.getCell(`Q${lastRowIndex + 2}`);
  totalCommisionAmountCell.value = { formula: `SUM(Q2:Q${lastRowIndex})` };

  const totalccAmountCell = worksheet.getCell(`S${lastRowIndex + 2}`);
  totalccAmountCell.value = { formula: `SUM(S2:S${lastRowIndex})` };

  const totalRefundAmountCell = worksheet.getCell(`T${lastRowIndex + 2}`);
  totalRefundAmountCell.value = { formula: `SUM(T2:T${lastRowIndex})` };

  worksheet.columns.forEach((column) => {
    column.style = {
      font: { bold: true },
      alignment: { horizontal: 'center' },
      fill: {
        type: 'pattern',
        pattern: 'darkVertical',
        fgColor: { argb: 'D9D9D9' },
      },
    };
  });
  const data = await workbook.xlsx.writeFile(
    `${distPath}/${currentYear}-${currentMonth}_supplier_${supplierUUID}_report.xlsx`,
  );
  return `${currentYear}-${currentMonth}_supplier_${supplierUUID}_report.xlsx`;
};

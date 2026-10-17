import { generalResponse, responseType } from '@/helper/common.helper';
import { TRANSACTION_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import Orders from '@/models/orders.model';
import PaymentDetail from '@/models/paymentDetails.model';
import StoreInfo from '@/models/storesInfo.model';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import CategoryRepo from '@/repository/Category/category.repository';
import ProductsRepo from '@/repository/Products/products.repository';
import { NextFunction, Request, Response } from 'express';

export class TransactionController {
  constructor(
    private readonly categoryRepository: CategoryRepo,
    private readonly productRepository: ProductsRepo,
    private readonly supplierRepository: SupplierInfoRepo,
  ) {}

  public readonly getGeneralInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const getCount = [];
      const getCategory = await this.categoryRepository.getAllData({});
      const getProduct = await this.productRepository.getAllData({});
      const getSupplier = await this.supplierRepository.getAllData({});
      const getStore = await StoreInfo.findAndCountAll();
      const getTransaction = await PaymentDetail.findAndCountAll();
      const getBankTransfer = await Orders.findAndCountAll({
        where: {
          payment_mode: 'BANK_TRANSFER',
        },
      });
      getCount.push(
        { name: 'Total Suppliers', count: getSupplier.count, redirect: '/admin/supplier' },
        { name: 'Total Store Owners', count: getStore.count, redirect: '/admin/store' },
        { name: 'Total Products', count: getProduct.count, redirect: '/admin/products' },
        { name: 'Total Categories', count: getCategory.count, redirect: '/admin/categories' },
        { name: 'Total Transactions', count: getTransaction.count, redirect: '/admin/payment' },
        { name: 'Total BankTransfers', count: getBankTransfer.count, redirect: '/admin/bank-transfer' },
      );
      return generalResponse(
        res,
        getCount,
        TRANSACTION_MESSAGES.GENERAL_COUNT_REPORT_FETCH,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

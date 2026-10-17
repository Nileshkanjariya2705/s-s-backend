import { NextFunction, Request, Response } from 'express';
import { generalResponse, responseType } from '@/helper/common.helper';
import { ADMIN_MESSAGES, SUPPLIER_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import Address from '@/models/address.model';
import SupplierInfo from '@/models/supplierinfo.model';
import User from '@/models/user.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import db from '@/models';
import AccountRepo from '@/repository/Authentication/account.repository';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import OrderRepo from '@/repository/Orders/order.repository';
import PaymentDetail from '@/models/paymentDetails.model';
import Orders from '@/models/orders.model';
import { Sequelize } from 'sequelize';
import PaymentDetailsRepo from '@/repository/Payment/paymentDetails.repository';
import { Op } from 'sequelize';
import SupplierQuotesRepo from '@/repository/SupplierQuotes/supplierQuotes.repository';
import StoreInfo from '@/models/storesInfo.model';
import PurchaseRequestRepo from '@/repository/PurchaseRequest/purchaseRequest.repository';
import SupplierProductsRepo from '@/repository/SupplierProducts/supplierProducts.repository';
import SupplierAdminReports from '@/models/supplierAdminReports';

export class SupplierController {
  constructor(
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly accountRepository: AccountRepo,
    private readonly supplierRepository: SupplierInfoRepo,
    private readonly orderRepository: OrderRepo,
    private readonly paymentdetailRepository: PaymentDetailsRepo,
    private readonly supplierQuotesRepository: SupplierQuotesRepo,
    private readonly purchaseRequestRepository: PurchaseRequestRepo,
    private readonly supplierProductRepository: SupplierProductsRepo,
  ) {}

  public readonly getSingleSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.body;
      let getSingleSupplier = [];

      const result = await db.transaction(async (t) => {
        const getSingleUserAccount = await this.accountUserRepository.getAll({
          where: {
            uuid,
          },
          attributes: ['uuid', 'user_uuid'],
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
            {
              model: SupplierInfo,
              attributes: { exclude: ['created_at', 'updated_at', 'deleted_at'] },
            },
          ],
          transaction: t,
        });

        if (getSingleUserAccount.length > 0) {
          getSingleSupplier.push({
            username: getSingleUserAccount[0].user.username,
            email: getSingleUserAccount[0].user.email,
            profile_image: getSingleUserAccount[0].user.image,
            phone: getSingleUserAccount[0].user.phone,
            address: getSingleUserAccount[0].user.address,
            company_name: getSingleUserAccount[0].supplier_uuid.company_name,
            cr_number: getSingleUserAccount[0].supplier_uuid.cr_number,
            tax_number: getSingleUserAccount[0].supplier_uuid.tax_number,
            iban_number: getSingleUserAccount[0].supplier_uuid.iban_number,
            is_verified: getSingleUserAccount[0].supplier_uuid.is_verified,
            is_active: getSingleUserAccount[0].supplier_uuid.is_active,
            ord_commission: getSingleUserAccount[0].supplier_uuid.Ord_Commission,
            bank_commission: getSingleUserAccount[0].supplier_uuid.Bank_Commission,
          });
          return generalResponse(
            res,
            getSingleSupplier,
            ADMIN_MESSAGES?.SUPPLIER_DATA_FETCHED,
            responseType.SUCCESS,
            true,
            200,
          );
        } else {
          return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        account_user_uuid,
        email,
        username,
        phone,
        cr_number,
        tax_number,
        iban_number,
        company_name,
        is_active,
        ord_commission,
        bank_commission,
      } = req.body;
      let finalResponse = {};
      const result = await db.transaction(async (t) => {
        const account = await this.accountUserRepository.get({
          where: {
            uuid: account_user_uuid,
          },
          transaction: t,
          raw: true,
        });
        const findUser = await this.accountRepository.get({
          where: {
            uuid: account.user_uuid,
          },
        });
        const whereClause: {
          [Op.or]: Array<{ [key: string]: string }>;
        } = {
          [Op.or]: [{ email: email }, { username: username }],
        };
        if (phone) {
          whereClause[Op.or].push({ phone: phone });
        }
        const checkExist = await this.accountRepository.getAll({
          where: whereClause,
        });
        if (checkExist.length > 1) {
          return generalResponse(res, null, USER_MESSAGES.USER_EXIST, responseType.FAILURE, false, 200);
        }

        const checkSupplierExist = await this.supplierRepository.getAll({
          where: {
            [Op.or]: [
              { cr_number: cr_number },
              { tax_number: tax_number !== undefined && tax_number },
              { iban_number: iban_number },
              { company_name: company_name },
            ],
          },
        });
        const checkStoreExist = await StoreInfo.findAll({
          where: {
            [Op.or]: [
              { cr_number: cr_number },
              { tax_number: tax_number !== undefined && tax_number },
              { iban_number: iban_number },
              { company_name: company_name },
            ],
          },
        });
        if (checkSupplierExist.length > 1) {
          return generalResponse(res, null, USER_MESSAGES.USER_EXIST, responseType.FAILURE, false, 200);
        }
        if (checkStoreExist.length) {
          return generalResponse(res, null, USER_MESSAGES.RECORD_EXIST, responseType.FAILURE, false, 200);
        }
        if (account) {
          await User.update(
            {
              ...req.body,
              image: req.file && req.file.filename ? req.file.filename : findUser.image,
            },
            {
              where: {
                uuid: account.user_uuid,
              },
              transaction: t,
            },
          );
          await SupplierInfo.update(
            {
              ...req.body,
              tax_number: req.body.tax_number ? req.body.tax_number : null,
              Ord_Commission: parseFloat(ord_commission),
              Bank_Commission: parseFloat(bank_commission),
            },
            {
              where: {
                uuid: account.entity_uuid,
              },
              transaction: t,
            },
          );
          const userDetail = await this.accountRepository.get({
            where: { uuid: account.user_uuid },
          });
          const storeDetail = await SupplierInfo.findOne({
            where: { uuid: account.entity_uuid },
          });

          if (
            (userDetail.phone || phone) &&
            (storeDetail.company_name || company_name) &&
            (storeDetail.iban_number || iban_number) &&
            (storeDetail.tax_number || (tax_number !== undefined && tax_number)) &&
            (storeDetail.cr_number || cr_number)
          ) {
            await SupplierInfo.update({ is_verified: true }, { where: { uuid: account.entity_uuid }, transaction: t });
          }
          return generalResponse(res, account, SUPPLIER_MESSAGES.UPDATED_SUCCESSFUL, responseType.SUCCESS, false, 200);
        } else {
          t.rollback();
          return generalResponse(res, '', USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteSupplier = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.params;
      const result = await db.transaction(async (t) => {
        const findAccount = await this.accountUserRepository.get({
          where: {
            uuid: uuid,
          },
          transaction: t,
        });
        if (!findAccount) {
          return generalResponse(
            res,
            null,
            SUPPLIER_MESSAGES?.UNAUTHORIZE_DELETE_REQUEST,
            responseType.FAILURE,
            true,
            200,
          );
        }
        const deleteAccount = await this.accountUserRepository.deleteData({
          where: {
            uuid: uuid,
          },
          transaction: t,
        });
        const deleteSupplier = await this.supplierRepository.deleteData({
          where: {
            uuid: findAccount.entity_uuid,
          },
          transaction: t,
        });
        const deleteUser = await this.accountRepository.deleteData({
          where: {
            uuid: findAccount.user_uuid,
          },
          transaction: t,
        });
        const deleteAddress = await this.accountRepository.deleteData({
          where: {
            uuid: findAccount.user_uuid,
          },
          transaction: t,
        });
        return generalResponse(res, '', SUPPLIER_MESSAGES?.DELETED_SUCCESSFUL, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSuppDashboardDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplier_uuid, supplier_info_uuid } = req.query;
      const getEarning: any = await PaymentDetail.findAll({
        attributes: [[Sequelize.fn('SUM', Sequelize.col('amount')), 'totalAmount']],
        include: [
          {
            model: Orders,
            where: {
              supplier_info_uuid: supplier_info_uuid as string,
            },
            attributes: [],
          },
        ],
        where: {
          payment_status: 'SUCCESS',
        },
        raw: true,
      });

      const totalProductsCount = await this.supplierProductRepository.getCount({
        where: {
          supplier_info_uuid: supplier_info_uuid as string,
        },
      });
      const getTotalQuote = await this.supplierQuotesRepository.getCount({
        where: {
          quoted_by: supplier_uuid as string,
        },
      });

      const suppDashData = {
        totalEarning: getEarning[0]?.totalAmount || 0,
        totalPrd: totalProductsCount,
        totalQuotes: getTotalQuote,
      };
      return generalResponse(res, suppDashData, SUPPLIER_MESSAGES.DATA_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getMonthlyFinanceData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { supplierId } = req.query;
      const monthlyData = await SupplierAdminReports.findAll({
        where: {
          supplier_info_uuid: supplierId as string,
        },
        attributes: ['month', 'year', 'uuid'],
      });
      return generalResponse(res, monthlyData, SUPPLIER_MESSAGES.DATA_FETCHED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getFinancePdfData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { financeId } = req.query;
      const pdfData = await SupplierAdminReports.findOne({
        where: {
          uuid: financeId as string,
        },
        attributes: ['file',"sheets", 'uuid', 'status'],
      });
      return generalResponse(res, pdfData, SUPPLIER_MESSAGES.DATA_FETCHED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getFinanceApproved = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { financeId } = req.body;
      const pdfData = await SupplierAdminReports.update(
        {
          status: 'PAID',
        },
        {
          where: {
            uuid: financeId as string,
          },
        },
      );
      return generalResponse(res, pdfData, SUPPLIER_MESSAGES.DATA_FETCHED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

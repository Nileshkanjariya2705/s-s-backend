import { generalResponse, responseType } from '@/helper/common.helper';
import { USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountUsers from '@/models/accountUsers.model';
import Address from '@/models/address.model';
import AdminSettings from '@/models/adminSettings.model';
import OrderProducts from '@/models/orderProduct.model';
import OrderProductsReplaceRequest from '@/models/orderProductsReplaceRequest.model';
import OrderReplacementRequests from '@/models/orderReplacement';
import Orders from '@/models/orders.model';
import PaymentDetail from '@/models/paymentDetails.model';
import RefundOrderProducts from '@/models/refundOrderProducts.model';
import RefundOrders from '@/models/refundOrders.model';
import SupplierInfo from '@/models/supplierinfo.model';
import User from '@/models/user.model';
import AdminSettingsRepo from '@/repository/AdminSettings/adminSettings.repository';
import { NextFunction, Request, Response } from 'express';
import moment from 'moment';
import { Op, Sequelize } from 'sequelize';

export class AdminSettingsController {
  constructor(private readonly adminsettingsRepo: AdminSettingsRepo) {}
  public readonly updateVatCharges = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { vat_percentage } = req.body;
      const getAdminSettingData = await this.adminsettingsRepo.get( {
        where:{
          current_active:true
        }
      });
      await db.transaction(async (t) => {
        const adminSettings = await this.adminsettingsRepo.createAdminSettings(
          {
            data: {
              vat_percentage: vat_percentage,
              replacement_days: getAdminSettingData?.dataValues?.replacement_days,
              refundable_days: getAdminSettingData?.dataValues?.refundable_days,
              default_ord_commission: getAdminSettingData?.dataValues?.default_ord_commission,
              default_bank_commission: getAdminSettingData?.dataValues?.default_bank_commission,
              current_active:true
            },
            action: 'create',
          },
          { transaction: t },
        );
        await AdminSettings.update(
          {
            current_active: false,
          },
          { where: { uuid: getAdminSettingData?.dataValues?.uuid }, transaction: t },
        );
        return generalResponse(res, adminSettings, USER_MESSAGES.VATCHARGES_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateReplaceDays = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { replacement_days } = req.body;
      const getAdminSettingData = await this.adminsettingsRepo.get( {
        where:{
          current_active:true
        }
      });
      await db.transaction(async (t) => {
        const adminSettings = await this.adminsettingsRepo.createAdminSettings(
          {
            data: {
              replacement_days: replacement_days,
              vat_percentage: getAdminSettingData?.dataValues?.vat_percentage,
              refundable_days: getAdminSettingData?.dataValues?.refundable_days,
              default_ord_commission: getAdminSettingData?.dataValues?.default_ord_commission,
              default_bank_commission: getAdminSettingData?.dataValues?.default_bank_commission,
              current_active:true
            },
            action: 'create',
          },
          { transaction: t },
          
        );
        await AdminSettings.update(
          {
            current_active: false,
          },
          { where: { uuid: getAdminSettingData?.dataValues?.uuid }, transaction: t },
        );
        return generalResponse(res, adminSettings, USER_MESSAGES.REPLACEDAYS_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getVatCharge = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findCharges = await this.adminsettingsRepo.get({
        where :{
          current_active:true
        }
      });

      return generalResponse(res, findCharges, USER_MESSAGES.VATCHARGES_GET, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  // public readonly updateVatCharge = async (req: Request, res: Response, next: NextFunction) => {
  //   try {
  //     const { vat_charge, uuid } = req.body;

  //     const adminSettings = await this.adminsettingsRepo.get({
  //       where: { uuid: uuid },
  //     });

  //     const updateUser = await this.adminsettingsRepo.updateAdminSettings({
  //       data: {
  //         vat_percentage: vat_charge,
  //       },
  //       action: 'update',
  //       adminSettings,
  //     });

  //     return generalResponse(res, updateUser, USER_MESSAGES.VATCHARGES_GET, responseType.SUCCESS, true, 200);
  //   } catch (error) {
  //     return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
  //   }
  // };

  public readonly createRefundDays = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refundable_days } = req.body;
      const getAdminSettingData = await this.adminsettingsRepo.get( {
        where:{
          current_active:true
        }
      });
      await db.transaction(async (t) => {
        const adminSettings = await this.adminsettingsRepo.createAdminSettings(
          {
            data: {
              refundable_days: refundable_days,
              vat_percentage: getAdminSettingData?.dataValues?.vat_percentage,
              replacement_days: getAdminSettingData?.dataValues?.replacement_days,
              default_ord_commission: getAdminSettingData?.dataValues?.default_ord_commission,
              default_bank_commission: getAdminSettingData?.dataValues?.default_bank_commission,
              current_active: true
            },
            action: 'create',
          },
          { transaction: t },
        );
        await AdminSettings.update(
          {
            current_active: false,
          },
          { where: { uuid: getAdminSettingData?.dataValues?.uuid }, transaction: t },
        );
        return generalResponse(res, adminSettings, USER_MESSAGES.REPLACEDAYS_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getadminSettingData = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminSettingData = await this.adminsettingsRepo.get({
        where:{
          current_active:true
        },
        attributes: { exclude: [ 'deleted_at', 'uuid'] },
      });

      return generalResponse(res, adminSettingData, USER_MESSAGES.VATCHARGES_GET, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly createOrdCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { default_ord_commission } = req.body;
      const getAdminSettingData = await this.adminsettingsRepo.get( {
        where:{
          current_active:true
        }
      });
      await db.transaction(async (t) => {
        const adminSettings = await this.adminsettingsRepo.createAdminSettings(
          {
            data: {
              default_ord_commission: default_ord_commission,
              refundable_days: getAdminSettingData?.dataValues?.refundable_days,
              vat_percentage: getAdminSettingData?.dataValues?.vat_percentage,
              replacement_days: getAdminSettingData?.dataValues?.replacement_days,
              default_bank_commission: getAdminSettingData?.dataValues?.default_bank_commission,
              current_active: true
            },
            action: 'create',
          },
          { transaction: t },
        );
        await AdminSettings.update(
          {
            current_active: false,
          },
          { where: { uuid: getAdminSettingData?.dataValues?.uuid }, transaction: t },
        );
        return generalResponse(res, adminSettings, USER_MESSAGES.DEFAULT_ORD_COMMISSION_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly createBankCommission = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { default_bank_commission } = req.body;
      const getAdminSettingData = await this.adminsettingsRepo.get( {
        where:{
          current_active:true
        }
      });
      await db.transaction(async (t) => {
        const adminSettings = await this.adminsettingsRepo.createAdminSettings(
          {
            data: {
              default_bank_commission: default_bank_commission,
              default_ord_commission: getAdminSettingData?.dataValues?.default_ord_commission,
              refundable_days: getAdminSettingData?.dataValues?.refundable_days,
              vat_percentage: getAdminSettingData?.dataValues?.vat_percentage,
              replacement_days: getAdminSettingData?.dataValues?.replacement_days,
              current_active: true
            },
            action: 'create',
          },
          { transaction: t },
        );
        await AdminSettings.update(
          {
            current_active: false,
          },
          { where: { uuid: getAdminSettingData?.dataValues?.uuid }, transaction: t },
        );
        return generalResponse(res, adminSettings, USER_MESSAGES.DEFAULT_BANK_COMMISSION_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

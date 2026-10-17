import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Op, where } from 'sequelize';
import db from '@/models';
import { generalResponse, matchPassword, responseType } from '@/helper/common.helper';
import { USER_MESSAGES } from '@/messages/users.messages';
import AccountRepo from '@/repository/Authentication/account.repository';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import AddressRepo from '@/repository/Authentication/address.repository';
import StoreInfoRepo from '@/repository/Authentication/storeInfo.repository';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import { AuthenticatedRequest } from '@/interfaces/general.interface';
import Address from '@/models/address.model';
import { ADMIN_EMAIL } from '@/config';
import User from '@/models/user.model';

export class ManageProfileController {
  constructor(
    private readonly accountRepository: AccountRepo,
    private readonly accountRoleRepository: AccountRolesRepo,
    private readonly storeInfoRepository: StoreInfoRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly supplierInfoRepository: SupplierInfoRepo,
    private readonly addressRepository: AddressRepo,
  ) {}
  public readonly updatePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, password, email } = req.body;
      const result = await db.transaction(async (t) => {
        const user = await this.accountRepository.getUserAccount({ username: email });
        const isMatch = await matchPassword(oldPassword, user?.password);
        const hashedPassword = await bcrypt.hash(password, 10);
        if (!isMatch) {
          return generalResponse(
            res,
            null,
            USER_MESSAGES.USERNAME_OR_PASSWORD_DOES_NOT_MATCH,
            responseType.FAILURE,
            true,
            200,
          );
        } else {
          const updatedPassword = await User.update(
            {
              password: hashedPassword,
            },
            {
              where: {
                uuid: user.uuid,
              },
            },
          );
          return generalResponse(res, null, USER_MESSAGES.PASSWORD_UPDATED, responseType.SUCCESS, false, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateOwnershipDetials = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { iban_number, tax_number, phone, company_name, username, cr_number } = req.body;
      const result = await db.transaction(async (t) => {
        let getOwnerShopDetails;
        let updatedOwnerdata;
        const user = await this.accountRepository.getUserAccount({ username: req.user.email });
        const updateUserDetails = await User.update(
          {
            image: req.file && req.file.filename ? req.file.filename : req.body.photo === null ? null : user?.image,
            phone: phone,
            username: username,
          },
          {
            where: {
              uuid: user.uuid,
            },
          },
        );
        const StoreInfo = await this.accountUserRepository.get({
          attributes: ['entity_type', 'entity_uuid'],
          where: {
            user_uuid: user.uuid,
          },
          raw: true,
        });

        if (StoreInfo.entity_type === 'STORE') {
          getOwnerShopDetails = await this.storeInfoRepository.get({
            where: {
              uuid: StoreInfo.entity_uuid,
            },
          });
          updatedOwnerdata = await this.storeInfoRepository.updateStoreInfo({
            data: {
              cr_number: cr_number,
              tax_number: tax_number,
              company_name: company_name,
              iban_number: iban_number,
            },
            action: 'update',
            StoreInfo: getOwnerShopDetails,
          });

          if (
            (user.phone || phone) &&
            (getOwnerShopDetails.company_name || company_name) &&
            (getOwnerShopDetails.iban_number || iban_number) &&
            (getOwnerShopDetails.tax_number || tax_number) &&
            (getOwnerShopDetails.cr_number || cr_number)
          ) {
            updatedOwnerdata = await this.storeInfoRepository.updateStoreInfo({
              data: {
                is_verified: true,
              },
              action: 'update',
              StoreInfo: getOwnerShopDetails,
            });
          }
          return generalResponse(res, updatedOwnerdata, USER_MESSAGES.PORFILE_UPDATE, responseType.SUCCESS, false, 200);
        } else {
          getOwnerShopDetails = await this.supplierInfoRepository.get({
            where: {
              uuid: StoreInfo.entity_uuid,
            },
          });

          updatedOwnerdata = await this.storeInfoRepository.updateStoreInfo({
            data: {
              cr_number: cr_number,
              tax_number: tax_number,
              company_name: company_name,
              iban_number: iban_number,
            },
            action: 'update',
            StoreInfo: getOwnerShopDetails,
          });

          if (
            (user.phone || phone) &&
            (getOwnerShopDetails.company_name || company_name) &&
            (getOwnerShopDetails.iban_number || iban_number) &&
            (getOwnerShopDetails.tax_number || tax_number) &&
            (getOwnerShopDetails.cr_number || cr_number)
          ) {
            updatedOwnerdata = await this.storeInfoRepository.updateStoreInfo({
              data: {
                is_verified: true,
              },
              action: 'update',
              StoreInfo: getOwnerShopDetails,
            });
          }
          return generalResponse(res, updatedOwnerdata, USER_MESSAGES.PORFILE_UPDATE, responseType.SUCCESS, false, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly setDefaultAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { address_uuid } = req.body;
      const result = await db.transaction(async (t) => {
        const user = await this.accountRepository.getUserAccount({ username: req.user.email });
        await Address.update({ is_default: false }, { where: { user_uuid: user.uuid, deleted_at: null } });
        const updateDefaultAddress = await Address.update({ is_default: true }, { where: { uuid: address_uuid } });
        return generalResponse(
          res,
          updateDefaultAddress,
          USER_MESSAGES.DEFAULT_ADDRESS_UPDATE,
          responseType.SUCCESS,
          false,
          200,
        );
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSingleAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await db.transaction(async (t) => {
        const singleAddress = await this.addressRepository.get({
          where: {
            uuid: req.params.uuid,
          },
        });
        return generalResponse(res, singleAddress, USER_MESSAGES.ADDRESS_FETCHED, responseType.SUCCESS, false, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly deleteAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await db.transaction(async (t) => {
        const findAddress = await this.addressRepository.get({
          where: {
            uuid: req.params.uuid,
            is_default: true,
          },
          transaction: t,
        });
        if (findAddress) {
          return generalResponse(res, null, USER_MESSAGES.ADDRESS_IS_DEFAULT, responseType.FAILURE, false, 200);
        } else {
          const removeAddress = await Address.update(
            { deleted_at: new Date().getTime() },
            { where: { uuid: req.params.uuid, deleted_at: null } },
          );
          if (removeAddress) {
            return generalResponse(res, null, USER_MESSAGES.ADDRESS_DELETED, responseType.SUCCESS, false, 200);
          } else {
            return generalResponse(res, null, USER_MESSAGES.ADDRESS_DELETE_FAILED, responseType.FAILURE, false, 200);
          }
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { uuid, is_default, postal_code, city, state, country, address, user_uuid, phone } = req.body;

      const result = await db.transaction(async (t) => {
        const findAddress = await this.addressRepository.get({
          where: {
            uuid: uuid,
          },
          transaction: t,
        });
        if (findAddress) {
          const updateAddress = await Address.update(
            {
              address: address,
              city: city,
              country: country,
              is_default: is_default,
              phone: phone,
              state: state,
              user_uuid: user_uuid,
              postal_code: postal_code,
            },
            { where: { uuid: uuid }, transaction: t },
          );
          return generalResponse(res, null, USER_MESSAGES.ADDRESS_UPDATE_SUCCESS, responseType.SUCCESS, false, 200);
        } else {
          return generalResponse(res, null, USER_MESSAGES.ADDRESS_UPDATE_FAILED, responseType.FAILURE, false, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly createAddress = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { postal_code, city, state, country, address, user_uuid, phone, user_entity_uuid, entity_type } = req.body;

      const result = await db.transaction(async (t) => {
        const checkFirstAddress = await Address.findOne({
          where: {
            entity_info_uuid: user_entity_uuid,
            is_default: true,
          },
        });
        if (req.body.default) {
          const getAddress = await Address.update(
            { is_default: false },
            {
              where: {
                entity_info_uuid: user_entity_uuid,
                is_default: true,
              },
            },
          );
        } else {
          if (!checkFirstAddress) {
            req.body.default = true;
          }
        }
        const createAddress = await this.addressRepository.createAddress(
          {
            data: {
              address: address,
              city: city,
              country: country,
              is_default: req.body.default ? req.body.default : false,
              phone: phone,
              state: state,
              user_uuid: user_uuid,
              postal_code: postal_code,
              entity_type: entity_type,
              entity_info_uuid: user_entity_uuid,
            },
            action: 'create',
          },
          { transaction: t },
        );

        return generalResponse(res, null, USER_MESSAGES.ADDRESS_CREATED, responseType.SUCCESS, false, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllAddressOfSingleUser = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const result = await db.transaction(async (t) => {
        const getAddress = await this.addressRepository.getAll({
          where: {
            user_uuid: req.params.uuid,
          },
        });
        return generalResponse(res, getAddress, USER_MESSAGES.ADDRESS_FETCHED, responseType.SUCCESS, false, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly adminManageProfile = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const createData = {
        image: req.file && req.file.filename ? req.file.filename : req.body.image === 'null' ? null : req.body.image,
        name: req?.body?.email,
        phone: req?.body?.phone,
        username: req?.body?.username,
      };
      const user = await this.accountRepository.get({ where: { email: ADMIN_EMAIL } });

      const updateUser = await User.update(
        {
          ...createData,
        },
        {
          where: {
            uuid: user.uuid,
          },
        },
      );

      return generalResponse(res, updateUser, USER_MESSAGES.UPDATE, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAdminProfileDetails = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const response = await this.accountRepository.getUserAccountPassword({ username: req.user.email });
      return generalResponse(res, response, USER_MESSAGES.ADMIN_DETAILS_FETCHED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly adminManagePassword = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const hashedPassword = await bcrypt.hash(req?.body?.password, 10);
      const createData = {
        password: hashedPassword,
      };
      const user = await this.accountRepository.get({ where: { email: ADMIN_EMAIL } });
      await User.update(
        {
          ...createData,
        },
        { where: { uuid: user.uuid } },
      );

      return generalResponse(res, null, USER_MESSAGES.PASSWORD_UPDATED, responseType.SUCCESS, false, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

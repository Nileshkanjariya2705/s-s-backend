import { entityType, generalResponse, hashPassword, matchPassword, responseType } from '@/helper/common.helper';
import { TOKEN_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountRepo from '@/repository/Authentication/account.repository';
import StoreInfoRepo from '@/repository/Authentication/storeInfo.repository';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import StoreInfo from '@/models/storesInfo.model';
import SupplierInfo from '@/models/supplierinfo.model';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import Roles from '@/models/roles.model';
import { generateAccessToken, generateForgetPassToken } from '@/helper/auth.helper';
import { AuthenticatedRequest } from '@/interfaces/general.interface';
import { sendMail } from '@/helper/mail.helper';
import { FRONT_URL, SERVER_URL, TAP_AUTHORIZATION } from '@/config';
import AddressRepo from '@/repository/Authentication/address.repository';
import PermissionRepo from '@/repository/Permission/permission.repository';
import RolePermissions from '@/models/rolePermissions.model';
import NotificationRepo from '@/repository/Notification/notification.repository';
import NotificationRecieverRepo from '@/repository/NotificationReciever/notificationReciever.repository';
import { LINK_TO_ENTITY, SIGNUP_NOTIFICATIONS } from '@/messages/notificationMessages';
import axios from 'axios';
import SaveCardRepo from '@/repository/SaveCard/saveCard.repository';
import { ADMIN_NOTIFICATION_CONTENT, LINK_TO_ENTITY_CONSTANT } from '@/constants/notification';
import { TAP_URL } from '@/config';
import { ADMIN_NOTIFICATION_UUID } from '@/config';
import User from '@/models/user.model';
import { checkGoogleReCaptchaVerification } from '@/utils/util';
import AdminSettings from '@/models/adminSettings.model';
export class AccountController {
  constructor(
    private readonly accountRepository: AccountRepo,
    private readonly accountRoleRepository: AccountRolesRepo,
    private readonly storeInfoRepository: StoreInfoRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly supplierInfoRepository: SupplierInfoRepo,
    private readonly notificationRepository: NotificationRepo,
    private readonly notificationRecieverRepository: NotificationRecieverRepo,
    private readonly addressRepository: AddressRepo,
    private readonly permissionRepository: PermissionRepo,
    private readonly saveCardRepository: SaveCardRepo,
  ) {}

  public readonly createAccount = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, company_name, cr_number, tax_number, varient } = req.body;
      const verify = await checkGoogleReCaptchaVerification(req.body.reCAPTCHAtoken);
      if (!verify) {
        return generalResponse(res, null, 'reCaptcha verification fail', responseType.FAILURE,false,200);
      } else delete req.body.reCAPTCHAtoken;
      let finalResponse = {};
      const result = await db.transaction(async (t) => {
        const user = await this.accountRepository.get({
          where: {
            [Op.or]: [
              {
                email: email,
              },
              {
                username: username,
              },
            ],
            deleted_at: null,
          },
          transaction: t,
        });

        if (user) {
          return generalResponse(res, null, USER_MESSAGES.UNIQUE_EMAIL_ERROR, responseType.FAILURE, true, 200);
        } else {
          if (varient === 'STORE') {
            let tapCustomerId: string | null = null;
            if (TAP_AUTHORIZATION) {
              const customerUrl = `${TAP_URL}/customers`;

              const requestHeaders = {
                Authorization: TAP_AUTHORIZATION,
                accept: 'application/json',
                'content-type': 'application/json',
              };

              const createCustomerData = {
                first_name: username,
                email: email,
              };

              const response = await axios.post(customerUrl, createCustomerData, { headers: requestHeaders });
              tapCustomerId = response?.data?.id || null;
            }

            const checkStore = await StoreInfo.findOne({
              where: {
                [Op.or]: [
                  {
                    cr_number: cr_number,
                  },
                  {
                    company_name: company_name,
                  },
                ],
              },
            });
            if (checkStore) {
              return generalResponse(res, null, USER_MESSAGES.STORE_EXISTS, responseType.FAILURE, true, 200);
            }
            let whereClause: {} = {
              [Op.or]: [{ cr_number: cr_number }, { company_name: company_name }],
            };

            if (tax_number && tax_number !== '') {
              whereClause[Op.or].push({ tax_number: tax_number });
            }
            const checkSupplierExist = await this.supplierInfoRepository.getAll({
              where: whereClause,
            });
            if (checkSupplierExist.length) {
              return generalResponse(
                res,
                null,
                USER_MESSAGES.SOMEONE_ALREADY_REGISTERED,
                responseType.FAILURE,
                false,
                200,
              );
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const createUser = await this.accountRepository.createAccount(
              {
                data: {
                  username: username,
                  email: email,
                  password: hashedPassword,
                  is_active: true,
                },
                action: 'create',
              },
              { transaction: t },
            );
            const roluuId = await Roles.findOne({
              where: { name: entityType.STORE_OWNER },
              raw: true,
            });

            let createStoreInfo = await this.storeInfoRepository.createStoreInfo(
              {
                data: {
                  company_name: company_name,
                  cr_number: cr_number,
                  tax_number: tax_number,
                  user_uuid: createUser?.dataValues?.uuid,
                },
                action: 'create',
              },
              { transaction: t },
            );
            createStoreInfo = JSON.parse(JSON.stringify(createStoreInfo));
            const createAccountUser = await this.accountUserRepository.accountUser(
              {
                data: {
                  entity_type: 'STORE',
                  entity_uuid: createStoreInfo?.uuid,
                  user_uuid: createUser?.dataValues?.uuid,
                  role_uuid: roluuId?.uuid,
                },
                action: 'create',
              },
              { transaction: t },
            );

            await this.saveCardRepository.createSaveCard(
              {
                data: {
                  store_info_uuid: createStoreInfo?.uuid,
                  customer_id: tapCustomerId,
                },
                action: 'create',
              },
              { transaction: t },
            );

            // await this.notificationRepository.NotificationCreateHandler({
            //   related_entity_id: createUser?.dataValues?.uuid,
            //   related_entity_type: LINK_TO_ENTITY_CONSTANT.STORE_USER,
            //   notification_type: SIGNUP_NOTIFICATIONS,
            //   notification_content: ADMIN_NOTIFICATION_CONTENT.ADMIN_STORE_SIGNUP,
            //   notification_reciever: ['f29395e1-b97d-4278-8a79-8182299cb3a7'],
            // });

            const Notification = await this.notificationRepository.createNotification(
              {
                data: {
                  related_entity_type: 'STORE_SIGNUP',
                  related_entity_id: createUser?.dataValues?.uuid,
                  content_en: SIGNUP_NOTIFICATIONS.ADMIN_STORE_SIGNUP_EN(createStoreInfo?.uuid),
                  content_ar: SIGNUP_NOTIFICATIONS.ADMIN_STORE_SIGNUP_AR(createStoreInfo?.uuid),
                  content_ur: SIGNUP_NOTIFICATIONS.ADMIN_STORE_SIGNUP_UR(createStoreInfo?.uuid),
                  link_to_entity: LINK_TO_ENTITY.STORE_USER(createAccountUser?.dataValues?.uuid),
                },
                action: 'create',
              },
              { transaction: t },
            );

            await this.notificationRecieverRepository.createNotificationReciever(
              {
                data: {
                  notification_uuid: Notification.dataValues.uuid,
                  receiver_uuid: ADMIN_NOTIFICATION_UUID,
                },
                action: 'create',
              },
              { transaction: t },
            );
            await this.notificationRecieverRepository.Notificationbroadcaster(
              [
                {
                  notification_uuid: Notification.dataValues.uuid,
                  receiver_uuid: ADMIN_NOTIFICATION_UUID,
                },
              ],
              [ADMIN_NOTIFICATION_UUID],
              t,
            );

            await this.notificationRepository.NotificationCreateHandler({
              related_entity_id: createUser?.dataValues?.uuid,
              related_entity_type: 'STORE_SIGNUP',
              notification_type: SIGNUP_NOTIFICATIONS,
              notification_content: ADMIN_NOTIFICATION_CONTENT.ADMIN_STORE_SIGNUP,
              entity_info_uuid: createUser?.dataValues?.uuid,
              notification_reciever: [ADMIN_NOTIFICATION_UUID],
              entity_uuid: createStoreInfo?.uuid,
            });

            finalResponse = {
              createAccount: createUser,
              createAccountUser: createAccountUser,
              createStoreInfo: createStoreInfo,
            };
            return generalResponse(res, finalResponse, USER_MESSAGES.CREATE, responseType.SUCCESS, true, 200);
          } else {
            const checkSupplier = await SupplierInfo.findOne({
              where: {
                [Op.or]: [
                  {
                    cr_number: cr_number,
                  },
                  {
                    company_name: company_name,
                  },
                ],
              },
            });

            if (checkSupplier) {
              return generalResponse(res, null, USER_MESSAGES.SUPPLIER_EXISTS, responseType.FAILURE, true, 200);
            }
            let whereClause: {} = {
              [Op.or]: [{ cr_number: cr_number }, { company_name: company_name }],
            };

            if (tax_number && tax_number !== '') {
              whereClause[Op.or].push({ tax_number: tax_number });
            }
            const checkStoreExist = await this.storeInfoRepository.getAll({
              where: whereClause,
            });

            if (checkStoreExist.length) {
              return generalResponse(
                res,
                null,
                USER_MESSAGES.SOMEONE_ALREADY_REGISTERED,
                responseType.FAILURE,
                false,
                200,
              );
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            const createUser = await this.accountRepository.createAccount(
              {
                data: {
                  username: username,
                  email: email,
                  is_active: true,
                  password: hashedPassword,
                },
                action: 'create',
              },
              { transaction: t },
            );

            const role = await Roles.findOne({
              where: { name: entityType.SUPPLIER_OWNER },
              raw: true,
            });
            const adminSettings = await AdminSettings.findOne({
              where:{
                current_active:true
              }
            })

            let createStoreInfo = await this.supplierInfoRepository.createSupplier(
              {
                data: {
                  company_name: company_name,
                  cr_number: cr_number,
                  tax_number: tax_number,
                  user_uuid: createUser?.dataValues?.uuid,
                  Ord_Commission:adminSettings?.dataValues?.default_ord_commission,
                  Bank_Commission:adminSettings?.dataValues?.default_bank_commission,
                },
                action: 'create',
              },
              { transaction: t },
            );
            createStoreInfo = JSON.parse(JSON.stringify(createStoreInfo));

            const createAccountUser = await this.accountUserRepository.accountUser(
              {
                data: {
                  entity_type: 'SUPPLIER',
                  entity_uuid: createStoreInfo?.uuid,
                  user_uuid: createUser?.dataValues?.uuid,
                  role_uuid: role?.uuid,
                },
                action: 'create',
              },
              { transaction: t },
            );
            const Notification = await this.notificationRepository.createNotification(
              {
                data: {
                  related_entity_type: 'SUPPLIER_SIGNUP',
                  related_entity_id: createUser?.dataValues?.uuid,
                  content_en: SIGNUP_NOTIFICATIONS.ADMIN_SUPPLIER_SIGNUP_EN(createStoreInfo?.uuid),
                  content_ar: SIGNUP_NOTIFICATIONS.ADMIN_SUPPLIER_SIGNUP_AR(createStoreInfo?.uuid),
                  content_ur: SIGNUP_NOTIFICATIONS.ADMIN_SUPPLIER_SIGNUP_UR(createStoreInfo?.uuid),
                  link_to_entity: LINK_TO_ENTITY.SUPPLIER_USER(createAccountUser?.dataValues?.uuid),
                },
                action: 'create',
              },
              { transaction: t },
            );

            await this.notificationRecieverRepository.createNotificationReciever(
              {
                data: {
                  notification_uuid: Notification.dataValues.uuid,
                  receiver_uuid: ADMIN_NOTIFICATION_UUID,
                },
                action: 'create',
              },
              { transaction: t },
            );

            await this.notificationRecieverRepository.Notificationbroadcaster(
              [
                {
                  notification_uuid: Notification.dataValues.uuid,
                  receiver_uuid: ADMIN_NOTIFICATION_UUID,
                },
              ],
              [ADMIN_NOTIFICATION_UUID],
              t,
            );

            // await this.notificationRepository.NotificationCreateHandler({
            //   related_entity_id: createUser?.dataValues?.uuid,
            //   related_entity_type: 'SUPPLIER_SIGNUP',
            //   notification_type: SIGNUP_NOTIFICATIONS,
            //   notification_content: ADMIN_NOTIFICATION_CONTENT.ADMIN_SUPPLIER_SIGNUP,
            //   entity_info_uuid: createUser?.dataValues?.uuid,
            //   notification_reciever: ['f29395e1-b97d-4278-8a79-8182299cb3a7'],
            //   entity_uuid: createStoreInfo?.dataValues?.uuid,
            // });
            finalResponse = {
              createAccount: createUser,
              createAccountUser: createAccountUser,
              createStoreInfo: createStoreInfo,
            };
            return generalResponse(res, finalResponse, USER_MESSAGES.CREATE, responseType.SUCCESS, true, 200);
          }
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getLoginDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, username } = req.body;
      const verify = await checkGoogleReCaptchaVerification(req.body.reCAPTCHAtoken);
      if (!verify) {
        return generalResponse(res, null, 'reCaptcha verification fail', responseType.FAILURE,false,200);
      } else delete req.body.reCAPTCHAtoken;
      const selectedAttributes = ['username', 'email', 'uuid', 'image', 'phone', 'created_at', 'is_active', 'password'];
      const user = await this.accountRepository.getUserAccount({ username }, selectedAttributes);
      const token = generateAccessToken({ email: user?.email });
      if (!user) {
        return generalResponse(res, null, USER_MESSAGES.USER_DOES_NOT_EXISTS, responseType.FAILURE, true, 200);
      } else if (user && user.is_active) {
        const accountUserRole = await this.accountUserRepository.get({
          include: [
            {
              model: Roles,
              attributes: ['name'],
            },
          ],
          raw: true,

          where: { user_uuid: user?.uuid },
        });
        let isEntityActive;
        if (accountUserRole.entity_type === 'STORE') {
          isEntityActive = await this.storeInfoRepository.get({
            where: {
              uuid: accountUserRole.entity_uuid,
            },
            raw: true,
          });
        } else {
          isEntityActive = await this.supplierInfoRepository.get({
            where: {
              uuid: accountUserRole.entity_uuid,
            },
            raw: true,
          });
        }

        const isMatch = await matchPassword(password, user?.password);
        if (
          isMatch &&
          accountUserRole &&
          accountUserRole['role_id.name'] !== entityType.SUPER_ADMIN &&
          (accountUserRole['role_id.name'] === entityType.STORE_OWNER ||
            accountUserRole['role_id.name'] === entityType.SUPPLIER_OWNER)
        ) {
          if (isEntityActive.is_active === 1) {
            let finalResponse = {
              token: token,
              user: user,
              role: accountUserRole['role_id.name'],
            };
            return generalResponse(res, finalResponse, USER_MESSAGES?.LOGIN, responseType.SUCCESS, false, 200);
          } else {
            return generalResponse(res, null, USER_MESSAGES.USER_DOES_NOT_EXISTS, responseType.FAILURE, true, 200);
          }
        } else if (isMatch && accountUserRole?.['role_id.name'] !== entityType.SUPER_ADMIN) {
          if (isEntityActive.is_active === 1) {
            let response = {
              role: accountUserRole['role_id.name'],
              token: token,
              user: user,
              entity_type: accountUserRole?.entity_type,
              account_user_entity_uuid: accountUserRole.entity_uuid,
            };
            return generalResponse(res, response, USER_MESSAGES?.LOGIN, responseType.SUCCESS, false, 200);
          } else {
            return generalResponse(res, null, USER_MESSAGES.COMPANY_INACTIVE, responseType.FAILURE, true, 200);
          }
        } else {
          return generalResponse(res, null, USER_MESSAGES.PASSWORD_DOES_NOT_MATCHED, responseType.FAILURE, true, 200);
        }
      } else {
        return generalResponse(res, null, USER_MESSAGES.USER_INACTIVE, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getAccountDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const response = await this.accountRepository.getUserAccount({ username: req.user.email });
      const accountUserRole = await this.accountUserRepository.get({
        include: [
          {
            model: Roles,
            attributes: ['name', 'uuid','name_ar','name_ur'],
          },
        ],
        raw: true,
        where: { user_uuid: response?.uuid },
      });

      const permissions = await this.permissionRepository.getAll({
        attributes: ['uuid', 'name', 'permission_type'],
        where: {
          permission_owner: accountUserRole.entity_type,
        },
      });
      const getRoleIdentity = await Roles.findOne({
        attributes: ['uuid'],
        where: {
          uuid: accountUserRole['role_id.uuid'],
        },
      });
      const getPermission = await RolePermissions.findAll({
        where: {
          role_uuid: getRoleIdentity.uuid,
        },
        attributes: ['permission_uuid'],
      });
      const result = {};
      permissions.forEach((item) => {
        result[item.uuid] = getPermission.some((permi) => permi.permission_uuid === item.uuid);
      });
      const given_permissions = Object.keys(result).map((uuid) => {
        const permission = permissions.find((p) => p.uuid === uuid);
        if (permission) {
          return {
            uuid,
            name: permission.name,
            permission_type: permission.permission_type,
            granted: result[uuid],
          };
        }
        return null;
      });
      const userRes = {
        ...response,
        role: accountUserRole['role_id.name'],
        role_ar: accountUserRole['role_id.name_ar'],
        role_ur: accountUserRole['role_id.name_ur'],
        user_entity_uuid: accountUserRole.entity_uuid,
        entity_type: accountUserRole.entity_type,
        all_permissions: permissions,
        given_permissions: given_permissions,
      };
      return generalResponse(res, userRes, USER_MESSAGES.GET, responseType.SUCCESS);
    } catch (error) {
      return generalResponse(res, null, error?.message, responseType.FAILURE, true, 500);
    }
  };

  public readonly forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.body;
      const user = await this.accountRepository.getUserAccount({ username });
      if (!user) {
        return generalResponse(res, null, USER_MESSAGES.WRONG_USER_OR_PASSWORD, responseType.FAILURE, true, 200);
      }
      const BASE_URL = `${SERVER_URL}/public/images`;
      const token = generateForgetPassToken({ email: user?.email });
      const replacement = {
        SERVER_URL,
        key: 'forgotPassword',
        mainText: 'hello',
        userEmail: `${user.username}`,
        link:
          user.email === 'admin@gmail.com'
            ? `${FRONT_URL}/admin/reset-password/${token}`
            : `${FRONT_URL}/reset-password/${token}`,
        helpText: '',
        buttonLabel: 'Reset Your Password',
        facebookUrl: `${BASE_URL}/facebook.png`,
        instagramUrl: `${BASE_URL}/instagram.png`,
        linkdinUrl: `${BASE_URL}/linkedin.png`,
        logoUrl: `${BASE_URL}/sitelogo.png`,
        passwordRecoveryUrl: `${BASE_URL}/password-recovery.svg`,
        twitterUrl: `${BASE_URL}/twitter.png`,
      };
      await sendMail([user?.email], 'Reset Your Password', 'forgotPassword', replacement);
      return generalResponse(res, null, USER_MESSAGES.MAIL_SENT, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateAccountPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body;
      await db.transaction(async (t) => {
        const email = req.user.email;

        const user = await this.accountRepository.getUserAccount({ username: email });

        if (!user) {
          return generalResponse(res, user, USER_MESSAGES.WRONG_USER_OR_PASSWORD, responseType.SUCCESS, true, 200);
        } else {
          const getPassword = await hashPassword(password);
          const accountUserRole = await this.accountUserRepository.get({
            include: [
              {
                model: Roles,
                attributes: ['name'],
              },
            ],
            raw: true,
            // attributes: ['default_roles_uuid'],
            where: { user_uuid: user?.uuid },
          });
          await User.update(
            {
              password: getPassword.hashedPassword,
            },
            {
              where: {
                uuid: user.uuid,
              },
            },
          );
          return generalResponse(
            res,
            accountUserRole['role_id.name'],
            USER_MESSAGES.PASSWORD_UPDATED,
            responseType.SUCCESS,
            true,
            200,
          );
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, true, 400);
    }
  };

  public readonly checkToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const response = await this.accountRepository.getUserAccount({ username: req.user.email });

      if (!response) {
        return generalResponse(res, null, TOKEN_MESSAGES.WRONG_TOKEN_ISSUE, responseType.SUCCESS);
      }
      return generalResponse(res, null, USER_MESSAGES.GET, responseType.SUCCESS);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly createMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, role, phone, varient, entity_uuid } = req.body;
      await db.transaction(async (t) => {
        const user = await this.accountRepository.get({
          where: {
            [Op.or]: [
              {
                email: email,
              },
              {
                username: username,
              },
            ],
          },
          transaction: t,
        });

        if (user) {
          return generalResponse(res, null, USER_MESSAGES.UNIQUE_EMAIL_ERROR, responseType.FAILURE, true, 200);
        } else {
          const hashedPassword = await bcrypt.hash(password, 10);
          if (varient === 'STORE') {
            const createUser = await this.accountRepository.createAccount(
              {
                data: {
                  username: username,
                  email: email,
                  password: hashedPassword,
                  is_active: true,
                },
                action: 'create',
              },
              { transaction: t },
            );
            const createRole = await Roles.create(
              {
                name: role,
                slug: role,

                action: 'create',
              } as {},
              { transaction: t },
            );
            const createAccountRole = await this.accountRoleRepository.createAccountRoles(
              {
                data: {
                  entity_type: 'STORE',
                  entity_uuid: entity_uuid,
                  role_uuid: createRole?.dataValues?.uuid,
                },
                action: 'create',
              },
              { transaction: t },
            );
            const createAccountUser = await this.accountUserRepository.accountUser(
              {
                data: {
                  entity_type: 'STORE',
                  entity_uuid: entity_uuid,
                  user_uuid: createUser?.dataValues?.uuid,
                  role_uuid: createRole?.dataValues?.uuid,
                },
                action: 'create',
              },
              { transaction: t },
            );
          } else {
            const createUser = await this.accountRepository.createAccount(
              {
                data: {
                  username: username,
                  email: email,
                  password: hashedPassword,
                  is_active: true,
                },
                action: 'create',
              },
              { transaction: t },
            );
            const createRole = await Roles.create(
              {
                name: role,
                slug: role,

                action: 'create',
              } as {},
              { transaction: t },
            );
            await this.accountUserRepository.accountUser(
              {
                data: {
                  entity_type: 'SUPPLIER',
                  entity_uuid: entity_uuid,

                  user_uuid: createUser?.dataValues?.uuid,
                  role_uuid: createRole?.dataValues?.uuid,
                },
                action: 'create',
              },
              { transaction: t },
            );
          }

          return generalResponse(res, null, USER_MESSAGES.CREATE, 'Success', true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getOwnerShopDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      let getOwnerShopDetails;

      const response = await this.accountRepository.getUserAccount({ username: req.user.email });

      if (!response) {
        return generalResponse(res, null, TOKEN_MESSAGES.WRONG_TOKEN_ISSUE, responseType.SUCCESS);
      }

      const getOwnerShopIdentity = await this.accountUserRepository.get({
        attributes: ['entity_type', 'entity_uuid'],
        where: {
          user_uuid: response.uuid,
        },
        raw: true,
      });

      const getOwnerShopAddresses = await this.addressRepository.getAll({
        where: {
          entity_info_uuid: getOwnerShopIdentity.entity_uuid,
          deleted_at: null,
        },
      });

      if (getOwnerShopIdentity.entity_type === 'STORE') {
        getOwnerShopDetails = await this.storeInfoRepository.get({
          where: {
            uuid: getOwnerShopIdentity.entity_uuid,
          },
        });
      } else {
        getOwnerShopDetails = await this.supplierInfoRepository.get({
          where: {
            uuid: getOwnerShopIdentity.entity_uuid,
          },
        });
      }
      const Address = getOwnerShopAddresses.map((item) => ({
        address_uuid: item.uuid,
        address: item.address,
        postal_code: item.postal_code,
        city: item.city,
        state: item.state,
        Country: item.country,
        Phone: item.phone.toString(),
        is_default: item.is_default,
        entity_type: item.entity_type,
        entity_info_uuid: item.entity_info_uuid,
      }));
      const finalResponse = {
        address: Address,
        store_uuid: getOwnerShopDetails.uuid,
        company_name: getOwnerShopDetails.company_name,
        cr_number: getOwnerShopDetails.cr_number,
        tax_number: getOwnerShopDetails.tax_number,
        iban_number: getOwnerShopDetails.iban_number,
        is_verified: getOwnerShopDetails.is_verified,
        ...getOwnerShopDetails,
      };
      return generalResponse(res, finalResponse, USER_MESSAGES.GET, responseType.SUCCESS);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

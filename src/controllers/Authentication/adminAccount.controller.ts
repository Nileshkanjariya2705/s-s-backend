import { NextFunction, Request, Response } from 'express';
import User from '@/models/user.model';
import {
  entityType,
  generalResponse,
  hashPassword,
  matchPassword,
  responseType,
  statusType,
} from '@/helper/common.helper';
import { ADMIN_MESSAGES, SUPPLIER_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import StoreInfo from '@/models/storesInfo.model';
import SupplierInfo from '@/models/supplierinfo.model';
import AccountRepo from '@/repository/Authentication/account.repository';
import Roles from '@/models/roles.model';
import { generateAccessToken, generateForgetPassToken } from '@/helper/auth.helper';
import { FRONT_URL, SERVER_URL } from '@/config';
import { AuthenticatedRequest } from '@/interfaces/general.interface';
import db from '@/models';
import { sendMail } from '@/helper/mail.helper';
import { Op } from 'sequelize';
import SupplierAdminReports from '@/models/supplierAdminReports';
import AccountUsers from '@/models/accountUsers.model';
const sequelize = require('sequelize');

export class AdminAccountController {
  constructor(
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly accountRepository: AccountRepo,
  ) {}

  public readonly getAdminLoginDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { password, username } = req.body;
      const selectedAttributes = ['username', 'email', 'uuid', 'image', 'phone', 'created_at', 'password'];
      const user = await this.accountRepository.getUserAccount({ username }, selectedAttributes);
      if (user) {
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

        const isMatch = await matchPassword(password, user?.password);
        if (isMatch && accountUserRole && accountUserRole['role_id.name'] === entityType.SUPER_ADMIN) {
          const token = generateAccessToken({ email: user?.email });
          let finalResponse = {
            token: token,
            user: user,
            role: accountUserRole['role_id.name'],
          };
          return generalResponse(res, finalResponse, USER_MESSAGES?.LOGIN, responseType.SUCCESS, true, 200);
        } else {
          return generalResponse(res, null, USER_MESSAGES.PASSWORD_DOES_NOT_MATCHED, responseType.FAILURE, true, 200);
        }
      } else {
        return generalResponse(res, null, USER_MESSAGES.NOT_FOUND_USER, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getStoreInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, apiParams } = req.query;
      const { page, limit, sort, isAsc, searchText, extraParams } = apiParams as any;

      const isOrderAsc = isAsc === 'true';
      let getStoreInfo = [];
      let accountUserRole;
      if (type === 'store' || type === 'supplier') {
        const attribute = type === 'store' ? 'store_uuid' : 'supplier_uuid';

        let order;
        if (sort) {
          if (sort === 'username' || sort === 'email' || sort === 'created_at' || sort === 'phone') {
            order = [['user', sort, isOrderAsc ? 'ASC' : 'DESC']];
          }
          if (sort === 'company_name' || sort === 'is_verified' || sort === 'is_active') {
            order = [[attribute, sort, isOrderAsc ? 'ASC' : 'DESC']];
          }
        }

        let search = searchText;
        let srch = {};
        if (search) {
          if (type === 'store') {
            srch = {
              [Op.or]: [
                {
                  '$user.username$': {
                    [Op.like]: `%${search}%`,
                  },
                },
                {
                  '$user.email$': {
                    [Op.like]: `%${search}%`,
                  },
                },
                {
                  '$user.phone$': {
                    [Op.like]: `%${search}%`,
                  },
                },
                {
                  '$store_uuid.company_name$': {
                    [Op.like]: `%${search}%`,
                  },
                },
              ],
            };
          } else {
            srch = {
              [sequelize.Op.or]: [
                {
                  '$user.username$': {
                    [sequelize.Op.like]: `%${search}%`,
                  },
                },
                {
                  '$user.email$': {
                    [sequelize.Op.like]: `%${search}%`,
                  },
                },
                {
                  '$user.phone$': {
                    [Op.like]: `%${search}%`,
                  },
                },
                {
                  '$supplier_uuid.company_name$': {
                    [sequelize.Op.like]: `%${search}%`,
                  },
                },
              ],
            };
          }
        }

        const role = await Roles.findOne({
          where: {
            name: type === 'store' ? entityType.STORE_OWNER : entityType.SUPPLIER_OWNER,
          },
        });

        let userWhere = {
          ...(extraParams?.name ? { username: extraParams?.name } : {}),
          ...(extraParams?.email ? { email: extraParams?.email } : {}),
        };
        let entityWhere = {
          ...(extraParams?.company_name ? { company_name: extraParams.company_name } : {}),
          ...(extraParams?.status ? { is_active: extraParams.status === 'ACTIVE' ? 1 : 0 } : {}),
        };

        accountUserRole = await this.accountUserRepository.getAllData({
          // raw: true,
          where: { role_uuid: role.uuid, ...srch },
          include: [
            { model: User, attributes: ['email', 'username', 'image', 'phone', 'created_at'], where: { ...userWhere } },
            {
              model: type === 'store' ? StoreInfo : SupplierInfo,
              attributes: ['company_name', 'cr_number', 'tax_number', 'is_verified', 'is_active'],
              where: { ...entityWhere },
            },
          ],
          limit: +limit,
          offset: (+page - 1) * +limit,
          order: order ? order : [['created_at', 'DESC']],
          attributes: ['uuid'],
        });

        if (accountUserRole) {
          accountUserRole.rows.forEach((data) => {
            getStoreInfo.push({
              uuid: data['uuid'],
              ...data['user'].dataValues,
              ...data[`${type}_uuid`].dataValues,
            });
          });
          return generalResponse(
            res,
            { getStoreInfo, count: accountUserRole.count },
            ADMIN_MESSAGES?.STORE_DATA_FETCHED,
            responseType.SUCCESS,
            true,
            200,
          );
        }
      }
      return generalResponse(res, [], ADMIN_MESSAGES?.STORE_DATA_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly adminForgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username } = req.body;
      const user = await this.accountRepository.getUserAccount({ username });

      if (!user) {
        return generalResponse(res, null, USER_MESSAGES.CORRECT_MAIL, responseType.FAILURE, true, 200);
      }
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
      const BASE_URL = `${SERVER_URL}/public/images`;
      if (accountUserRole && accountUserRole['role_id.name'] === entityType.SUPER_ADMIN) {
        const token = generateForgetPassToken({ email: user?.email });
        const replacement = {
          SERVER_URL,
          key: 'forgotPassword',
          mainText: 'hello',
          userEmail: `${user.username}`,
          link: `${FRONT_URL}/admin/reset-password/${token}`,
          helpText: '',
          buttonLabel: 'Reset Your Password',
          facebookUrl: `${BASE_URL}/facebook.png`,
          instagramUrl: `${BASE_URL}/instagram.png`,
          linkdinUrl: `${BASE_URL}/linkedin.png`,
          logoUrl: `${BASE_URL}/sitelogo.png`,
          passwordRecoveryUrl: `${BASE_URL}/password-recovery.png`,
          twitterUrl: `${BASE_URL}/twitter.png`,
        };

        await sendMail([user?.email], 'Reset Your Password', 'forgotPassword', replacement);
        return generalResponse(res, null, USER_MESSAGES.MAIL_SENT, responseType.SUCCESS, true, 200);
      } else {
        return generalResponse(res, null, USER_MESSAGES.NOT_FOUND_USER, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateAdminAccountPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body;

      await db.transaction(async (t) => {
        const email = req.user.email;
        const user = await this.accountRepository.getUserAccount({ username: email });

        if (!user) {
          return generalResponse(res, user, USER_MESSAGES.NOT_FOUND, responseType.FAILURE, true, 200);
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
    
  public readonly getMonthlyFinanceData = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = req.query;
        const supplier = await AccountUsers.findOne({
            where: {
                uuid:userId as string
            },
            attributes:["entity_uuid"]
        })
      const monthlyData = await SupplierAdminReports.findAll({
        where: {
          supplier_info_uuid: supplier.entity_uuid as string,
          },
          attributes:["month","year","uuid"]
      });
        return generalResponse(res,monthlyData,SUPPLIER_MESSAGES.DATA_FETCHED,responseType.SUCCESS,false,200)
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

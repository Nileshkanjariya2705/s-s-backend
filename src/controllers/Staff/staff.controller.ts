import { entityType, generalResponse, matchPassword, responseType } from '@/helper/common.helper';
import { STAFF_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import AccountUsers from '@/models/accountUsers.model';
import Roles from '@/models/roles.model';
import User from '@/models/user.model';
import AccountRepo from '@/repository/Authentication/account.repository';
import AccountRolesRepo from '@/repository/Authentication/accountRoles.repository';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import { NextFunction, Request, Response } from 'express';
import { Op } from 'sequelize';
const { Sequelize } = require('sequelize');
import bcrypt from 'bcrypt';
import BranchesRepo from '@/repository/Branches/branches.repository';
import BranchUsersRepo from '@/repository/Branches/branchUser.repository';
import Branch from '@/models/branches.model';
import { SERVER_URL } from '@/config';
import { sendMail } from '@/helper/mail.helper';
import StoreInfoRepo from '@/repository/Authentication/storeInfo.repository';
import SupplierInfoRepo from '@/repository/Authentication/supplier.repository';
export class staffController {
  constructor(
    private readonly accountRepository: AccountRepo,
    private readonly accountRoleRepository: AccountRolesRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly branchusersRepository: BranchUsersRepo,
    private readonly branchesRepository: BranchesRepo,
    private readonly storeInfoRepository: StoreInfoRepo,
    private readonly supplierInfoRepository: SupplierInfoRepo,
  ) {}

  public readonly getStaffMembers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_uuid, user_entity_uuid, apiParams } = req.query;
      const { page, limit, sort, isAsc, searchText } = apiParams as any;
      const isOrderAsc = isAsc === 'true';
      let order;

      if (sort) {
        if (sort === 'username' || sort === 'email' || sort === 'is_active') {
          order = [['user', sort, isOrderAsc ? 'ASC' : 'DESC']];
        }
      }

      let srch = {};
      if (searchText) {
        srch = {
          [Op.or]: [
            {
              '$user.username$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              '$user.email$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              '$user.phone$': {
                [Op.like]: `%${searchText}%`,
              },
            },
            {
              '$role_id.name$': {
                [Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      const getOwnerRole = await Roles.findAll({
        attributes: ['uuid'],
        where: {
          [Op.or]: [
            {
              name: entityType.SUPPLIER_OWNER,
            },
            {
              name: entityType.STORE_OWNER,
            },
          ],
        },
      });
      const getStaffUser = await this.accountUserRepository.getAllData({
        attributes: { exclude: ['updated_at', 'uuid', 'entity_type', 'user_uuid', 'deleted_at'] },
        where: {
          ...srch,
          entity_uuid: user_entity_uuid as string,
          [Op.and]: [
            {
              role_uuid: {
                [Op.ne]: getOwnerRole[0].uuid,
              },
            },
            {
              role_uuid: {
                [Op.ne]: getOwnerRole[1].uuid,
              },
            },
          ],
        },
        include: [
          { model: Roles, attributes: ['name'] },
          {
            model: User,
            attributes: { exclude: ['password', 'created_at'] },
            where: {
              uuid: {
                [Op.ne]: user_uuid as string,
              },
            },
          },
        ],
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
      const getUserIds = getStaffUser.rows.map((item) => {
        return item.user.uuid;
      });
      const userBranchDetails = [];
      const getStaffBranch = [];

      for (let user of getUserIds) {
        const data = await this.branchusersRepository.getAll({
          where: {
            user_uuid: user,
          },
          include: [
            {
              model: Branch,
              attributes: ['name'],
              where: {
                status: 'Active',
              },
            },
          ],
        });
        getStaffBranch.push(data);
      }
      const result = {};

      getStaffBranch.forEach((item) => {
        item.forEach((ele) => {
          const { user_uuid, branch } = ele;
          if (!result[user_uuid]) {
            result[user_uuid] = '';
          }
          if (result[user_uuid].length > 0) {
            result[user_uuid] += ', ';
          }
          result[user_uuid] += branch.name;
        });
      });

      const userArrayWithBranchName = getStaffUser.rows.map((userObj, index) => {
        userObj.user.dataValues['branch_name'] = result[userObj.user.dataValues.uuid];
        return userObj;
      });

      return generalResponse(
        res,
        { count: getStaffUser.count, rows: userArrayWithBranchName },
        STAFF_MESSAGES.STAFF_MEMBER_FETCHED,
        responseType.SUCCESS,
        true,
        200,
      );
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleStaffMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { user_uuid } = req.query;
      const getStaffUser = await this.accountUserRepository.get({
        attributes: { exclude: ['updated_at', 'created_at', 'uuid', 'entity_type', 'user_uuid', 'deleted_at'] },
        where: {
          user_uuid: user_uuid as string,
        },
        include: [
          {
            model: Roles,
            attributes: ['name'],
          },
          {
            model: User,
            attributes: { exclude: ['created_at', 'image', 'updated_at', 'deleted_at', 'password'] },
            where: {
              uuid: user_uuid as string,
            },
          },
        ],
      });

      const resultObject = {
        role_uuid: getStaffUser?.role_uuid,
        role: getStaffUser?.role_id?.name,
        uuid: getStaffUser?.user?.uuid,
        email: getStaffUser?.user?.email,
        username: getStaffUser?.user?.username,
        password: '',
        phone: getStaffUser?.user?.phone,
        is_active: getStaffUser?.user?.is_active,
      };

      return generalResponse(res, resultObject, STAFF_MESSAGES.STAFF_MEMBER_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateSingleStaffMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid, password, username, email, phone, role_uuid, role, is_active } = req.body;
      await db.transaction(async (t) => {
        const roleName = await Roles.findOne({
          where: {
            uuid: role,
          },
          attributes: ['name', 'uuid'],
          raw: true,
        });
        const user = await this.accountRepository.get({
          where: {
            uuid: uuid,
          },
          transaction: t,
          raw: true,
        });
        const userExist = await this.accountRepository.getAll({
          where: {
            [Op.or]: [
              {
                username: username,
              },
              {
                email: email,
              },
            ],
          },
        });
        if (!user) {
          return generalResponse(res, null, USER_MESSAGES.NOT_FOUND, responseType.FAILURE, true, 200);
        } else {
          const isMatch = await matchPassword(password, user?.password);
          if (isMatch) {
            if (userExist.length > 1) {
              return generalResponse(res, null, USER_MESSAGES.UNIQUE_EMAIL_ERROR, responseType.FAILURE, true, 200);
            } else {
              const hashedPassword = await bcrypt.hash(password, 10);
              const updateMemberUser = await User.update(
                {
                  password: hashedPassword,
                  phone: phone,
                  email: email,
                  username: username,
                  is_active: is_active,
                },
                {
                  where: {
                    uuid: uuid,
                  },
                  transaction: t,
                },
              );
              const updateAccountUsers = await AccountUsers.update(
                {
                  role_uuid: roleName?.uuid,
                },
                {
                  where: {
                    user_uuid: uuid,
                  },
                  transaction: t,
                },
              );
              const memberDetail = {
                username,
                password,
                email,
                phone,
                RoleName: roleName ? roleName?.name : role,
              };
              const replacement = {
                SERVER_URL,
                key: 'MemberDetail',
                mainText: 'hello',
                memberDetail: memberDetail,
              };
              await sendMail([email], 'Member Login Details', 'memberDetails', replacement);
              return generalResponse(res, null, STAFF_MESSAGES.STAFF_MEMBER_UPDATED, responseType.SUCCESS, true, 200);
            }
          } else {
            return generalResponse(
              res,
              null,
              USER_MESSAGES.USERNAME_OR_PASSWORD_DOES_NOT_MATCH,
              responseType.FAILURE,
              true,
              200,
            );
          }
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly createMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password, email, phone, varient, entity_uuid, role, is_active } = req.body;
      const result = await db.transaction(async (t) => {
        const roleName = await Roles.findOne({
          where: {
            uuid: role,
          },
          attributes: ['name'],
        });
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
            const checkIbanNumber = await this.storeInfoRepository.get({
              where: {
                uuid: entity_uuid,
              },
              attributes: ['iban_number'],
            });
            if (!checkIbanNumber.iban_number) {
              return generalResponse(res, null, STAFF_MESSAGES.IBAN_NUMBER, responseType.FAILURE, true, 200);
            }
            const createUser = await this.accountRepository.createAccount(
              {
                data: {
                  username: username,
                  email: email,
                  phone: phone,
                  password: hashedPassword,
                  is_active: is_active,
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
                  role_uuid: role,
                },
                action: 'create',
              },
              { transaction: t },
            );
          } else {
            const checkIbanNumber = await this.supplierInfoRepository.get({
              where: {
                uuid: entity_uuid,
              },
              attributes: ['iban_number'],
            });
            if (!checkIbanNumber.iban_number) {
              return generalResponse(res, null, STAFF_MESSAGES.IBAN_NUMBER, responseType.FAILURE, true, 200);
            }
            const createUser = await this.accountRepository.createAccount(
              {
                data: {
                  username: username,
                  email: email,
                  password: hashedPassword,
                  phone: phone,
                  is_active: is_active,
                },
                action: 'create',
              },
              { transaction: t },
            );
            const createAccountUser = await this.accountUserRepository.accountUser(
              {
                data: {
                  entity_type: 'SUPPLIER',
                  entity_uuid: entity_uuid,
                  user_uuid: createUser?.dataValues?.uuid,
                  role_uuid: role,
                },
                action: 'create',
              },
              { transaction: t },
            );
          }
          const memberDetail = {
            username,
            password,
            email,
            phone,
            RoleName: roleName.name,
          };

          const replacement = {
            SERVER_URL,
            key: 'MemberDetail',
            mainText: 'hello',
            memberDetail: memberDetail,
          };
          sendMail([email], 'Member Login Details', 'memberDetails', replacement);
          return generalResponse(res, null, STAFF_MESSAGES.STAFF_MEMBER_ADDED, responseType.SUCCESS, true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteMember = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user_uuid = req.params.user_uuid;
      const user = await this.accountRepository.get({
        where: {
          uuid: user_uuid,
        },
      });
      if (user) {
        const result = await db.transaction(async (t) => {
          const checkIsAssignedToBranch = await this.branchusersRepository.get({
            where: {
              user_uuid: user_uuid,
              deleted_at: null,
            },
            transaction: t,
          });
          if (checkIsAssignedToBranch) {
            return generalResponse(res, null, USER_MESSAGES.USER_ASSIGNED_TO_BRANCH, responseType.FAILURE, true, 200);
          } else {
            // const removeAccountUser = await this.accountUserRepository.deleteData({
            //   where: {
            //     user_uuid: user_uuid,
            //   },
            //   transaction: t,
            // });
            const deleteUser = await User.update(
              {
                is_active: false,
              },
              { where: { uuid: user_uuid }, transaction: t },
            );
            return generalResponse(res, null, STAFF_MESSAGES.STAFF_MEMBER_DELETED, responseType.SUCCESS, true, 200);
          }
        });
      } else {
        return generalResponse(res, null, USER_MESSAGES.UNIQUE_EMAIL_ERROR, responseType.FAILURE, true, 200);
      }
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import { entityType, generalResponse, responseType, statusType } from '@/helper/common.helper';
import { BRANCHES_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import db from '@/models';
import Address from '@/models/address.model';
import BranchUsers from '@/models/branchUser.model';
import Branch from '@/models/branches.model';
import User from '@/models/user.model';
import AccountUsersRepo from '@/repository/Authentication/accountUsers.repository';
import BranchUsersRepo from '@/repository/Branches/branchUser.repository';
import BranchesRepo from '@/repository/Branches/branches.repository';
import RolesRepo from '@/repository/Roles/roles.repository';
import { NextFunction, Response } from 'express';
import { Op } from 'sequelize';

const Sequelize = require('sequelize');

export class BranchesController {
  constructor(
    private readonly branchesRepository: BranchesRepo,
    private readonly branchuserRepository: BranchUsersRepo,
    private readonly accountUserRepository: AccountUsersRepo,
    private readonly rolesRepository: RolesRepo,
  ) {}
  public readonly getAllBranches = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { entity_uuid, apiParams } = req.query;
      const { page, limit, sort, isAsc, searchText } = apiParams;
      const isOrderAsc = isAsc === 'true';
      let order;

      if (sort) {
        if (sort === 'name' || sort === 'address' || sort === 'status') {
          order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
        }
      }
      let srch = {};

      if (searchText) {
        srch = {
          [Sequelize.Op.or]: [
            {
              name: {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              address: {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              status: {
                [Sequelize.Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      const getBranches = await this.branchesRepository.getAllData({
        attributes: { exclude: ['updated_at', 'entity_type', 'entity_uuid'] },
        where: {
          entity_uuid: entity_uuid,
          ...srch,
        },
        limit: +limit,
        offset: (+page - 1) * +limit,
        order: order ? order : [['created_at', 'DESC']],
      });

      const allData = getBranches.rows.map((item, index) => {
        return {
          ...item,
        };
      });

      const response = {
        count: getBranches.count,
        data: { branches: allData },
      };
      return generalResponse(res, response, BRANCHES_MESSAGES.BRANCH_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getBranchesDropdown = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { entity_uuid } = req.query;
      const getBranches = await this.branchesRepository.getAllData({
        attributes: { exclude: ['updated_at', 'entity_type', 'entity_uuid'] },
        where: {
          entity_uuid: entity_uuid,
        },
      });
      const response = await Promise.all(
        getBranches.rows.map(async (item) => {
          const getAddress = await Address.findOne({
            where: {
              branch_uuid: item?.uuid,
            },
          });
          return {
            label: item.name,
            value: getAddress?.uuid,
          };
        }),
      );

      return generalResponse(res, response, BRANCHES_MESSAGES.BRANCH_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getSingleBranches = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { branch_uuid } = req.query;
      const address = await Address.findOne({
        where: {
          branch_uuid: branch_uuid,
        },
      });
      const getBranches = await this.branchesRepository.get({
        attributes: { exclude: ['created_at', 'updated_at', 'entity_type', 'entity_uuid'] },
        where: {
          uuid: branch_uuid,
        },
      });
      const getBranchUser = await this.branchuserRepository.getAllData({
        where: {
          branch_uuid: branch_uuid,
          deleted_at: null,
        },
        include: [
          {
            model: User,
            attributes: ['username', 'uuid'],
            where: {
              is_active: true,
            },
          },
        ],
      });
      const getAccountRoles = await this.accountUserRepository.getAll({
        attributes: ['user_uuid'],
        where: {
          user_uuid: getBranchUser.rows.map((item) => item.user.uuid),
          // role_uuid: {
          //   [Op.ne]: roles[0].uuid || roles[1].uuid,
          // },
        },
      });
      const BranchUser = getAccountRoles.map((item) => {
        const matchingRow = getBranchUser.rows.find((row) => row.user_uuid === item.user_uuid);
        return {
          label: matchingRow.user.username,
          value: item.user_uuid,
        };
      });

      const response = {
        data: {
          branch: { ...getBranches.dataValues, postal_code: address.postal_code, phone: address.phone },
          users: BranchUser,
        },
      };
      return generalResponse(res, response, BRANCHES_MESSAGES.BRANCH_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly getEntityUser = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { entity_uuid } = req.query;
      const roles = await this.rolesRepository.getAll({
        attributes: ['uuid'],
        where: {
          name: {
            [Op.or]: [entityType.STORE_OWNER, entityType.SUPPLIER_OWNER],
          },
        },
      });

      const users = await this.accountUserRepository.getAll({
        where: {
          entity_uuid: entity_uuid,
          role_uuid: {
            [Op.notIn]: [roles[0].uuid, roles[1].uuid],
          },
        },
        include: [
          {
            model: User,
            attributes: ['username', 'uuid'],
            where: {
              is_active: true,
            },
          },
        ],
      });

      const BranchUser = users.map((item) => {
        return {
          label: item.user.username,
          value: item.user.uuid,
        };
      });
      return generalResponse(res, BranchUser, BRANCHES_MESSAGES.BRANCH_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly createBranch = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const {
        name,
        address,
        city,
        state,
        country,
        users,
        status,
        entity_uuid,
        entity_type,
        phone,
        postal_code,
        branch_owner_uuid,
      } = req.body;
      const result = await db.transaction(async (t) => {
        const branchExits = await this.branchesRepository.get({
          where: {
            name: name,
          },
        });
        if (branchExits?.entity_type === entity_type) {
          return generalResponse(res, null, BRANCHES_MESSAGES.BRANCH_EXISTS, responseType.FAILURE, true, 200);
        } else {
          const makeBranch = await this.branchesRepository.createBranch(
            {
              data: {
                name: name,
                address: address,
                city: city,
                state: state,
                country: country,
                status: status,
                entity_uuid: entity_uuid,
                entity_type: entity_type,
              },
              action: 'create',
            },
            { transaction: t },
          );
          await Address.create(
            {
              address: address,
              city: city,
              country: country,
              entity_type: entity_type,
              phone: phone,
              postal_code: postal_code,
              state: state,
              //here user of this branch will be branch users of that entity (as it is required field )
              is_default: true,
              branch_uuid: makeBranch.uuid,
            },
            { transaction: t },
          );
          //branch creater is default member of the branch
          users.push(branch_owner_uuid)
          const BranchUser = users.map((item) => {
            return {
              branch_uuid: makeBranch.uuid,
              user_uuid: item,
            };
          });
          
          await this.branchuserRepository.bulkCreate(BranchUser, { transaction: t });
          return generalResponse(res, null, BRANCHES_MESSAGES.BRANCH_CREATED, responseType.SUCCESS, true, 200);
        }
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly updateBranch = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const {
        branch_uuid,
        name,
        address,
        city,
        state,
        country,
        users,
        status,
        entity_uuid,
        entity_type,
        postal_code,
        phone,
        branch_owner_uuid,
      } = req.body;
      const result = await db.transaction(async (t) => {
        const updateBranch = await Branch.update(
          {
            name: name,
            address: address,
            city: city,
            state: state,
            country: country,
            status: status,
            entity_uuid: entity_uuid,
            entity_type: entity_type,
          },
          { where: { uuid: branch_uuid }, transaction: t },
        );
        await Address.update(
          {
            postal_code: postal_code,
            phone: phone,
          },
          {
            where: {
              branch_uuid: branch_uuid,
            },
          },
        );
        const getBranchUser = await this.branchuserRepository.getAllData({
          where: {
            branch_uuid: branch_uuid,
            deleted_at: null,
          },
          raw: true,
        });

        for (const branchUsr of getBranchUser.rows) {
          //branch creater cannot be unassigned to his own branch
          if(branchUsr.user_uuid !== branch_owner_uuid)
          await BranchUsers.destroy({
            where: {
              branch_uuid: branch_uuid,
              user_uuid: branchUsr.user_uuid,
            },
            transaction: t,
          });
        }
        for (const userUUID of users) {
          await BranchUsers.create(
            {
              branch_uuid: branch_uuid,
              user_uuid: userUUID,
              status: statusType.ACTIVE,
            },
            { transaction: t },
          );
        }
        return generalResponse(res, null, BRANCHES_MESSAGES.BRANCH_UPDATED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
  public readonly deleteBranch = async (req: Request | any, res: Response, next: NextFunction) => {
    try {
      const { branch_uuid } = req.params;
      const result = await db.transaction(async (t) => {
        const destroyBranchUsers = await this.branchuserRepository.deleteData({
          where: {
            branch_uuid: branch_uuid,
          },
        });
        const destoryBranch = await this.branchesRepository.deleteData({ where: { uuid: branch_uuid } });

        return generalResponse(res, null, BRANCHES_MESSAGES.BRANCH_DELETED, responseType.SUCCESS, true, 200);
      });
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

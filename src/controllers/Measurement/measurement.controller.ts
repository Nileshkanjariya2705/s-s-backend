import { NextFunction, Request, Response } from 'express';

import MeasurementRepo from '@/repository/Measurement/measurement.repository';
import { generalResponse, responseType } from '@/helper/common.helper';
import db from '@/models';
import { MESUREMENT_MESSAGES, USER_MESSAGES } from '@/messages/users.messages';
import Measurement from '@/models/measurement.model';
import { Op } from 'sequelize';
import ProductsRepo from '@/repository/Products/products.repository';
const sequelize = require('sequelize');

export class MeasurementController {
  constructor(
    private readonly measurementRepository: MeasurementRepo,
    private readonly productsRepository: ProductsRepo,
  ) {}
  public readonly createUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const findUnit = await this.measurementRepository.get({
        where: {
          [Op.or]: [
            {
              unit_name: req.body.unit_name,
            },
            {
              unit_short_name: req.body.unit_short_name,
            },
            {
              unit_name_ar: req.body.unit_name_ar,
            },
            {
              unit_short_name_ar: req.body.unit_short_name_ar,
            },
            {
              unit_name_ur: req.body.unit_name_ur,
            },
            {
              unit_short_name_ur: req.body.unit_short_name_ur,
            },
          ],
        },
      });
      if (findUnit) {
        return generalResponse(res, '', MESUREMENT_MESSAGES.UNIT_ALREADY_EXIST, responseType.FAILURE, true, 200);
      }
      await db.transaction(async (t) => {
        await this.measurementRepository.createMeasurement(
          {
            data: req.body,
          },
          { transaction: t },
        );
      });
      return generalResponse(res, '', MESUREMENT_MESSAGES.UNIT_ADDED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getAllUnits = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const apiParams = req.query;
      const { page, limit, sort, isAsc, searchText } = apiParams;
      const isOrderAsc = isAsc === 'true';
      let order;

      if (sort) {
        if (sort === 'unit_name' || sort === 'status' || sort === 'unit_short_name') {
          order = [[sort, isOrderAsc ? 'ASC' : 'DESC']];
        }
      }
      let srch = {};

      if (searchText) {
        srch = {
          [sequelize.Op.or]: [
            {
              unit_name: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              unit_short_name: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              unit_name_ar: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              unit_short_name_ar: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              unit_name_ur: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              unit_short_name_ur: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
            {
              status: {
                [sequelize.Op.like]: `%${searchText}%`,
              },
            },
          ],
        };
      }
      const getUnit = await this.measurementRepository.getAllData({
        attributes: { exclude: ['updated_at', 'deleted_at', 'created_at'] },
        where: { ...srch },
        order: order ? order : [['created_at', 'DESC']],
        limit: +limit,
        offset: (+page - 1) * +limit,
      });
      return generalResponse(res, getUnit, MESUREMENT_MESSAGES.ALL_UNITS_FETCHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly getSingleUnit = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { uuid } = req.body;
      const getSingleUnit = await this.measurementRepository.get({
        where: {
          uuid: uuid,
        },
        attributes: { exclude: ['updated_at', 'deleted_at', 'created_at'] },
      });
      return generalResponse(res, getSingleUnit, MESUREMENT_MESSAGES.UNIT_FETECHED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly updateUnit = async (req: Request, res: Response) => {
    try {
      const findUnit = await this.measurementRepository.get({
        where: {
          uuid: req.body.data.uuid,
        },
      });
      if (!findUnit) {
        return generalResponse(
          res,
          null,
          MESUREMENT_MESSAGES.UNIT_UNAUTHORIZE_UPDATE_REQUEST,
          responseType.FAILURE,
          true,
          200,
        );
      }

      const { unit_name, unit_name_ar, unit_name_ur, unit_short_name, unit_short_name_ar, unit_short_name_ur } =
        req.body.data;

      const findMeasurement = await this.measurementRepository.get({
        where: {
          [Op.and]: [
            {
              [Op.or]: [
                {
                  unit_name: unit_name,
                },
                {
                  unit_short_name: unit_short_name,
                },
                {
                  unit_name_ar: unit_name_ar,
                },
                {
                  unit_short_name_ar: unit_short_name_ar,
                },
                {
                  unit_name_ur: unit_name_ur,
                },
                {
                  unit_short_name_ur: unit_short_name_ur,
                },
              ],
            },
            {
              uuid: {
                [Op.ne]: req?.body?.data?.uuid,
              },
            },
          ],
        },
      });

      if (findMeasurement) {
        return generalResponse(res, '', MESUREMENT_MESSAGES.UNIT_ALREADY_EXIST, responseType.FAILURE, true, 200);
      }

      const updateUnit = await Measurement.update(
        {
          ...req.body.data,
        },
        { where: { uuid: req.body.data.uuid } },
      );

      return generalResponse(res, updateUnit, MESUREMENT_MESSAGES.UNIT_UPDATED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };

  public readonly deleteUnit = async (req: Request, res: Response) => {
    try {
      const { uuid } = req.params;
      const getProductsAssignedMeasurement: [] | number = await this.productsRepository.getCount({
        where: { measurement_uuid: uuid },
      });
      if (getProductsAssignedMeasurement > 0) {
        return generalResponse(res, null, MESUREMENT_MESSAGES.UNIT_ALREADY_ASSIGNED, responseType.FAILURE, true, 200);
      }
      await this.measurementRepository.deleteData({
        where: {
          uuid: uuid,
        },
      });
      return generalResponse(res, null, MESUREMENT_MESSAGES.UNIT_DELETED, responseType.SUCCESS, true, 200);
    } catch (error) {
      return generalResponse(res, error.message, USER_MESSAGES.CATCH_RESPONSE, responseType.FAILURE, false, 400);
    }
  };
}

import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import { BuildCmsReviewArgs } from '@/interfaces/Authentication/cmsReview.interface';
import Measurement from '@/models/measurement.model';
import { BuildMeasurementArgs } from '@/interfaces/Measurement/measurement.interface';

export default class MeasurementRepo extends BaseRepository<Measurement> {
  constructor() {
    super(Measurement.name);
  }
  readonly createMeasurement = async (measurementCreateArgs: BuildMeasurementArgs, extraParam: { transaction }) => {
    const { data } = measurementCreateArgs;

    const { transaction } = extraParam;

    const account = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return account;
  };

  readonly updateReview = async (cmsReviewCreateArgs: Required<BuildCmsReviewArgs>) => {
    const { data, cmsReview } = cmsReviewCreateArgs;
    return db.transaction(async (transaction) => {
      // set Data.
      const buildUser = setInstance({ ...data }, cmsReview);
      // save User
      await buildUser.save({ transaction });
      // set user roles table data.
      return buildUser;
    });
  };

  readonly checkMeasurementIsAcitve = async (measurement_uuid, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkMeasurement = await this.get({
      where: {
        uuid: measurement_uuid,
        status: 'active',
      },
      transaction: transaction,
    });
    return checkMeasurement ? true : false;
  };
  readonly getActiveMeasurement = async (attributes, extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkMeasurement = await this.getAllData({
      where: {
        status: 'active',
      },
      attributes: attributes,
      transaction: transaction,
    });
    return checkMeasurement;
  };
  readonly getMeasurementList = async (extraParam: { transaction }) => {
    const { transaction } = extraParam;
    const checkMeasurement = await this.getAllData({
      transaction: transaction,
    });
    return checkMeasurement;
  };
}

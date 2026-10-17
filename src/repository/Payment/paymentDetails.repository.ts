import PaymentDetail from '@/models/paymentDetails.model';
import BaseRepository from '../base.repository';
import { BuildPaymentDetailArgs } from '@/interfaces/Payment/paymentDetail.interface';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class PaymentDetailsRepo extends BaseRepository<PaymentDetail> {
  constructor() {
    super(PaymentDetail.name);
  }
  readonly createRequest = async (createPaymentDetailArgs: BuildPaymentDetailArgs, extraParam: { transaction }) => {
    const { data } = createPaymentDetailArgs;

    const { transaction } = extraParam;

    const paymentDetail = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return paymentDetail;
  };

  readonly updatePaymentDetail = async (paymentDetails: Required<BuildPaymentDetailArgs>) => {
    const { data, paymentDetail } = paymentDetails;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, paymentDetail);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };
}

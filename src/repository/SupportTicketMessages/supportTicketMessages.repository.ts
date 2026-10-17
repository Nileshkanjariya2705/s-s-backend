import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import { BuildSupportTicketMessageArgs } from '@/interfaces/SupportTicketMessages/supportTicketMessages.interface';
import SupportTicketMessages from '@/models/supportTicketMessages.model';

export default class SupportTicketMessageRepo extends BaseRepository<SupportTicketMessages> {
  constructor() {
    super(SupportTicketMessages.name);
  }

  readonly createSupportTicketMessage = async (
    supportTicketMessage: BuildSupportTicketMessageArgs,
    extraParam: { transaction },
  ) => {
    const { data } = supportTicketMessage;
    const { transaction } = extraParam;

    const supportTicketMessageCreate = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return supportTicketMessageCreate;
  };

  readonly updateSupportTicket = async (supportTicketMessage: Required<BuildSupportTicketMessageArgs>) => {
    const { data, SupportTicketMessage } = supportTicketMessage;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, SupportTicketMessage);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };
}

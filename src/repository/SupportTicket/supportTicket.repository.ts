import BaseRepository from '../base.repository';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';
import SupportTicket from '@/models/supportTicket.model';
import { BuildSupportTicketArgs } from '@/interfaces/SupportTicket/supportTicket.interface';

export default class SupportTicketRepo extends BaseRepository<SupportTicket> {
  constructor() {
    super(SupportTicket.name);
  }

  readonly createSupportTicket = async (supportTicket: BuildSupportTicketArgs, extraParam: { transaction }) => {
    const { data } = supportTicket;

    const { transaction } = extraParam;

    const supportTicketCreate = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return supportTicketCreate;
  };

  readonly updateSupportTicket = async (supportTickets: Required<BuildSupportTicketArgs>) => {
    const { data, supportTicket } = supportTickets;
    return db.transaction(async (transaction) => {
      const buildRequest = setInstance({ ...data }, supportTicket);
      await buildRequest.save({ transaction });
      return buildRequest;
    });
  };
}

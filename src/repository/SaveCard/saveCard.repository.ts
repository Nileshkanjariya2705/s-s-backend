import { BuildSaveCardArgs } from '@/interfaces/SaveCard/saveCard.interface';
import BaseRepository from '../base.repository';
import SaveCard from '@/models/saveCard.model';

export default class SaveCardRepo extends BaseRepository<SaveCard> {
  constructor() {
    super(SaveCard.name);
  }

  readonly createSaveCard = async (saveCardArgs: BuildSaveCardArgs, extraParam: { transaction }) => {
    const { data } = saveCardArgs;
    const { transaction } = extraParam;

    const saveCardInfo = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return saveCardInfo;
  };
}

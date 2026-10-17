import AdminSettings from '@/models/adminSettings.model';
import BaseRepository from '../base.repository';

import { BuildAdminSettingsArgs } from '@/interfaces/AdminSettings/adminSettings.interface';
import db from '@/models';
import { setInstance } from '@/helper/sequelize.helper';

export default class AdminSettingsRepo extends BaseRepository<AdminSettings> {
  constructor() {
    super(AdminSettings.name);
  }
  readonly createAdminSettings = async (
    adminSettingsCreateArgs: BuildAdminSettingsArgs,
    extraParam?: { transaction },
  ) => {
    const { data } = adminSettingsCreateArgs;
    const { transaction } = extraParam;

    const adminSettings = await this.create(
      {
        ...data,
      },
      { transaction },
    );
    return adminSettings;
  };

  readonly updateAdminSettings = async (adminSettingsCreateArgs: Required<BuildAdminSettingsArgs>) => {
    const { data, adminSettings } = adminSettingsCreateArgs;
    return db.transaction(async (transaction) => {
      const buildAdminSettings = setInstance({ ...data }, adminSettings);
      await buildAdminSettings.save({ transaction });
      return buildAdminSettings;
    });
  };
}

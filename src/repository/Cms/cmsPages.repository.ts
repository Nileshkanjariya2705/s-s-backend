import { setInstance } from '@/helper/sequelize.helper';
import { BuildCmsArgs } from '@/interfaces/Authentication/cms.interface';
import db from '@/models';
import CmsPages from '@/models/cmsPages.model';
import BaseRepository from '../base.repository';

export default class CmsPagesRepo extends BaseRepository<CmsPages> {
  constructor() {
    super(CmsPages.name);
  }
  readonly updateCmsPage = async (cmsCreateArgs: Required<BuildCmsArgs>) => {
    const { data, cms } = cmsCreateArgs;
    return db.transaction(async (transaction) => {
      // set Data.
      const buildCms = setInstance({ ...data }, cms);
      // save User
      await buildCms.save({ transaction });
      // set user roles table data.
      return buildCms;
    });
  };
}

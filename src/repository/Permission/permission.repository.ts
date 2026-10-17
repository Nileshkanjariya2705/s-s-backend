import Permissions from '@/models/permissions.model';
import BaseRepository from '../base.repository';

export default class PermissionRepo extends BaseRepository<Permissions> {
  constructor() {
    super(Permissions.name);
  }
}

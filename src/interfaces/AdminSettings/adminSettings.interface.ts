import AdminSettings from '@/models/adminSettings.model';
import { Request } from 'express';

export interface BuildAdminSettingsArgs {
  data: Request['body'];
  action: 'create' | 'update';
  adminSettings?: AdminSettings;
}

import { RequiredKey } from './common.interface';
export interface MeasurementAttributes {
  uuid: string;
  status: string;
  unit_name: string;
  unit_short_name: string;
  unit_name_ar: string;
  unit_short_name_ar: string;
  unit_name_ur: string;
  unit_short_name_ur: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredMeasurementAttributes = RequiredKey<MeasurementAttributes, 'uuid'>;

import Measurement from '@/models/measurement.model';
import { Request } from 'express';

export interface BuildMeasurementArgs {
  data: Request['body'];
  // action: 'create' | 'update';
  measurement?: Measurement;
}

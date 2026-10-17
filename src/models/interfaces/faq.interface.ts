import { RequiredKey } from './common.interface';
export interface FaqAttributes {
  uuid: string;
  question: string;
  answer: string;
  slug: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredFaqAttributes = RequiredKey<FaqAttributes, 'uuid'>;

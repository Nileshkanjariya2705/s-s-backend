import { RequiredKey } from './common.interface';
export interface CmsPagesAttributes {
  uuid: string;
  page_title: string;
  page_description: string;
  cms_content_en: string;
  cms_content_ur: string;
  cms_content_ar: string;
  slug: string;
  created_at: number;
  updated_at: number;
  deleted_at: number;
}

export type RequiredCmsPagesAttributes = RequiredKey<CmsPagesAttributes, 'uuid'>;

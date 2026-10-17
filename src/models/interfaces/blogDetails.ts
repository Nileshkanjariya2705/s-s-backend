import { RequiredKey } from './common.interface';
export interface BlogDetailsAttributes {
  uuid: string;

  title_en: string;

  body_en: string;

  title_ar: string;

  body_ar: string;

  title_ur: string;

  body_ur: string;

  cover_image: string;

  author_name_en: string;

  author_name_ar: string;

  author_name_ur: string;

  author_image: string;

  is_default: boolean;

  slug: string;

  created_at: number;

  updated_at: number;

  deleted_at: number;
}

export type RequiredBlogDetailsAttributes = RequiredKey<BlogDetailsAttributes, 'uuid'>;

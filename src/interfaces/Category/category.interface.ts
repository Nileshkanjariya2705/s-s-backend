import Category from '@/models/category.model';

export interface BuildCategoryArgs {
  data: Request['body'];
  action: 'create' | 'update';
  category?: Category;
}

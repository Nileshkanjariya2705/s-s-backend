import { Model, ModelCtor } from 'sequelize-typescript';

export interface IncludeAttribute {
  required?: boolean;
  separate?: boolean;
  paranoid?: boolean;
  select?: string;
  sort?: string;
  page?: number;
  limit?: number;
  q?: Record<string, any>;
  as?: string;
}

export interface IncludeParams {
  [key: string]: string | (IncludeAttribute & { include?: IncludeParams });
}

export interface GetIncludeQuery<M extends Model> {
  input: IncludeParams;
  model: ModelCtor<M>;
}

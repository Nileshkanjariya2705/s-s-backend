import { Request } from 'express';

export interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

export interface GeneralResponse<T> {
  data: T;
  message: string;
  responseType: string;
  success: boolean;
  statusCode: number;
}

export interface ApiResponse<T> {
  res: Response;
  data: T;
  message: string;
  responseType: string;
  statusCode: number;
}
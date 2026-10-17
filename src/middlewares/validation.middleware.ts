// =================== import packages ====================
import { RequestHandler } from 'express';
// ======================================================
import { cleanObj, generalResponse, responseType } from '@/helper/common.helper';
import { USER_MESSAGES } from '@/messages/users.messages';

interface Error {
  message: string;
  path: Object;
  type: string;
  context: any;
}

const errorFilterValidator = (error: Array<Error>) => {
  const extractedErrors: Array<string> = [];
  error.forEach((err: Error) => extractedErrors.push(err.message));
  const errorResponse = extractedErrors.join(', ');
  return errorResponse;
};

const validationMiddleware = (type: any, value: string | 'body' | 'query' | 'params' = 'body'): RequestHandler => {
  return async (req, res, next) => {
    try {
      cleanObj(req[value]);
      req[value] = await type.validateAsync(req[value]);
      next();
    } catch (e) {
      const error: any = e;
      if (error.details) {
        const errorResponse = errorFilterValidator(error.details);
        return generalResponse(res, null, errorResponse, 'error', true, 400);
      }
      return generalResponse(res, null, USER_MESSAGES.CATCH_RESPONSE, responseType.SUCCESS, true, 400);
    }
  };
};
export default validationMiddleware;

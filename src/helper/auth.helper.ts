import * as jwt from 'jsonwebtoken';
import { generalResponse, responseType } from './common.helper';
import { TOKEN_MESSAGES } from '@/messages/users.messages';
import { NextFunction, Request, Response } from 'express';

type AuthRequest = Request & {
  user?: string | jwt.JwtPayload;
};

export const generateAccessToken = (email:string) => {
  return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '2d' });
};

export const verifyToken = async (req: AuthRequest, res:Response, next:NextFunction) => {
  const token = req.headers['authorization'];
  if (!token) {
    return generalResponse(res, null, TOKEN_MESSAGES.ERROR, responseType.FAILURE, true, 403);
  }
  try {
    const decoded = await jwt.verify(token, process.env.TOKEN_SECRET as string);
    req.user = decoded;
    next();
  } catch (err) {
    return generalResponse(res, null, TOKEN_MESSAGES.ERROR, responseType.FAILURE, true, 403);
  }
};

export const generateForgetPassToken = (email:string) => {
  return jwt.sign(email, process.env.TOKEN_SECRET as string, { expiresIn: '1m' });
};

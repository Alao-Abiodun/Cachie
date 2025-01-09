import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import AppError from '../../utils/lib/appError';

const rateLimits: Map<string, number> = new Map();
const rateLimitWindow = 1000;
const rateLimitThreshold = 3;

const checkRateLimit = (clientId: string) => {
  const now = Date.now();
  const currentCount = rateLimits.get(clientId) || 0;

  rateLimits.forEach((count, id) => {
    if (now - rateLimitWindow > count) {
      rateLimits.delete(id);
    }
  });

  if (currentCount >= rateLimitThreshold) {
    return false;
  }

  rateLimits.set(clientId, now);
  return true;
};

export const rateLimiterMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const clientId: any = req.body.client_id;
  console.log('clientId', clientId);

  if (!clientId) {
    throw new AppError('Missing client ID', StatusCodes.BAD_REQUEST);
  }

  if (!checkRateLimit(clientId)) {
    throw new AppError('Rate limit exceeded', StatusCodes.TOO_MANY_REQUESTS);
  }

  next();
};
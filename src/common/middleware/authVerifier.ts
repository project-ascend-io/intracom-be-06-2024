import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

export const verifyAuthentication = (_req: Request, res: Response, next: NextFunction) => {
  const hasSession = !!_req.session.userId;
  const hasSessionExpired = false; // @todo check expiration date

  if (hasSession && !hasSessionExpired) {
    next();
  } else {
    const statusCode = StatusCodes.UNAUTHORIZED;
    res.status(statusCode).send(new ServiceResponse<null>(ResponseStatus.Failed, 'Unauthorized', null, statusCode));
  }
};

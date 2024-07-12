import { NextFunction, Request, Response } from 'express';

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if ((req.session as any).userId) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.status(401).send('Unauthorized'); // User is not authenticated, send an unauthorized response
  }
};

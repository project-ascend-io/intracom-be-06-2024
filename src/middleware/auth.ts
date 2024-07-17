import { NextFunction, Request, Response } from 'express';

// This checks if a user is authenticated by checking if the userId property exists in the session object associated with the current request. If it does, the function calls the next function to proceed to the next middleware or route handler. If the user is not authenticated, it sends an HTTP 401 Unauthorized response to the client.
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if ((req.session as any).userId) {
    next(); // User is authenticated, proceed to the next middleware or route handler
  } else {
    res.status(401).send('Unauthorized'); // User is not authenticated, send an unauthorized response
  }
};

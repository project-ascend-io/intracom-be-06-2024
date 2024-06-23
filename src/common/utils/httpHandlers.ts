import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError, ZodSchema } from 'zod';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

export const handleServiceResponse = (serviceResponse: ServiceResponse<any>, response: Response) => {
  return response.status(serviceResponse.statusCode).send(serviceResponse);
};

export const validateRequest = (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => {
  console.log('Validate Request - Body: ', req.body);
  try {
    schema.parse({ body: req.body, query: req.query, params: req.params });
    next();
  } catch (err) {
    console.log('Error', err);
    // const errorMessage = concatZodErrorMessages(err as ZodError);
    const errorMessage = `Invalid input: ${(err as ZodError).errors.map((e) => e.message).join(', ')}`;

    const statusCode = StatusCodes.BAD_REQUEST;
    res.status(statusCode).send(new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, statusCode));
  }
};

// const concatZodErrorMessages = (err: ZodError): string => {
//   let errorMessage: string = '';
//
//   err.errors.forEach((error: ZodIssue) => {
//     const attributeName = toTitleCase(error.path[0] as string);
//     errorMessage += `${attributeName} ${error.message}. `;
//   });
//   return errorMessage.trim();
// };

// const toTitleCase = (str: string) => {
//   return str.replace(/\p{L}+('\p{L}+)?/gu, function (txt) {
//     return txt.charAt(0).toUpperCase() + txt.slice(1);
//   });
// };

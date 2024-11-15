import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { authService } from '@/api/auth/authService';
import { LoginSchema } from '@/api/auth/authValidation';
import { userRepository } from '@/api/user/userRepository';
import { UserAuthResponse, UserAuthResponseSchema, UserResponse, UserResponseSchema } from '@/api/user/userSchema';
import { createApiResponses, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { verifyAuthentication } from '@/common/middleware/authVerifier';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const authRegistry = new OpenAPIRegistry();

export const authRouter: Router = (() => {
  const router = express.Router();

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Authentication'],
    request: {
      body: createPostBodyParams(LoginSchema.shape.body),
    },
    responses: createApiResponses([
      {
        schema: UserAuthResponseSchema,
        statusCode: StatusCodes.OK,
        description: 'Successfully logged in.',
      },
      {
        schema: z.null(),
        statusCode: StatusCodes.UNAUTHORIZED,
        description: 'Invalid Credentials',
      },
    ]),
  });

  router.post('/login', validateRequest(LoginSchema), async (_req: Request, res: Response) => {
    const credentials = LoginSchema.shape.body.parse({ ..._req.body });
    const serviceResponse = await authService.login(credentials);
    if (serviceResponse.success) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      _req.session.userId = serviceResponse.responseObject?._id;
      const authUser: UserAuthResponse = {
        ...(serviceResponse.responseObject as UserResponse),
        expires: _req.session.cookie.expires!.toISOString(),
      };
      serviceResponse.responseObject = authUser;
    }
    handleServiceResponse(serviceResponse, res);
  });

  authRegistry.registerPath({
    method: 'get',
    path: '/auth/check',
    tags: ['Authentication'],
    responses: createApiResponses([
      {
        schema: UserAuthResponseSchema,
        statusCode: StatusCodes.OK,
        description: 'Existing session is active and not expired.',
      },
      {
        schema: z.null(),
        statusCode: StatusCodes.UNAUTHORIZED,
        description: 'Existing session is expired or has been destroyed.',
      },
    ]),
  });

  router.get('/check', verifyAuthentication, async (_req: Request, res: Response) => {
    // userId will always be found, if userId doesn't exist, it will be caught in verifyAuthentication
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const foundUser = await userRepository.findByIdAsync(_req.session.userId);
    const authUser: UserAuthResponse = {
      ...(foundUser as UserResponse),
      expires: _req.session.cookie.expires!.toISOString(),
    };
    const serviceResponse = new ServiceResponse(ResponseStatus.Success, 'Active Session.', authUser, StatusCodes.OK);
    handleServiceResponse(serviceResponse, res);
  });

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Authentication'],
    responses: createApiResponses([
      {
        schema: z.null(),
        statusCode: StatusCodes.OK,
        description: 'Existing session has been destroyed.',
      },
      {
        schema: UserResponseSchema,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        description: 'Existing session could not be destroyed. Please try again.',
      },
    ]),
  });

  router.post('/logout', async (_req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!_req.session.userId) {
      const successResponse = new ServiceResponse(
        ResponseStatus.Success,
        'Successfully logged out.',
        null,
        StatusCodes.OK
      );
      handleServiceResponse(successResponse, res);
      return;
    }
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const foundUser = await userRepository.findByIdAsync(_req.session.userId);
    _req.session.destroy((err) => {
      if (err) {
        handleServiceResponse(
          new ServiceResponse(ResponseStatus.Failed, 'Unable to log out', foundUser, StatusCodes.INTERNAL_SERVER_ERROR),
          res
        );
        return;
      }
      handleServiceResponse(
        new ServiceResponse(ResponseStatus.Success, 'Successfully logged out.', null, StatusCodes.OK),
        res
      );
    });
  });

  return router;
})();

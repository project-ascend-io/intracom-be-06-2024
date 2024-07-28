import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { authService } from '@/api/auth/authService';
import { LoginSchema } from '@/api/auth/authValidation';
import { UserResponseSchema } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const authRegistry = new OpenAPIRegistry();

//authRegistry.register('Authentication', UserResponseSchema);

export const authRouter: Router = (() => {
  const router = express.Router();

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Authentication'],
    request: {
      body: createPostBodyParams(LoginSchema.shape.body),
    },
    responses: createApiResponse(UserResponseSchema, 'Success'),
  });

  router.post('/login', validateRequest(LoginSchema), async (_req: Request, res: Response) => {
    const credentials = LoginSchema.shape.body.parse({ ..._req.body });
    console.log('Credentials: ', credentials);
    const serviceResponse = await authService.login(credentials);
    handleServiceResponse(serviceResponse, res);
  });

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/check',
    tags: ['Authentication'],
    responses: createApiResponse(z.null(), 'Success'),
  });

  router.post('/check', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findById('1');
    handleServiceResponse(serviceResponse, res);
  });

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/logout',
    tags: ['Authentication'],
    responses: createApiResponse(z.null(), 'Success'),
  });

  router.post('/logout', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findById('1');
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

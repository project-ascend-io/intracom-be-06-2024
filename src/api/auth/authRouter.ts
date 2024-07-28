import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { LoginSchema } from '@/api/auth/authValidation';
import { UserResponseSchema } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { createApiResponse } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const authRegistry = new OpenAPIRegistry();

//authRegistry.register('Authentication', UserResponseSchema);

export const authRouter: Router = (() => {
  const router = express.Router();

  authRegistry.registerPath({
    method: 'post',
    path: '/auth/login',
    tags: ['Authentication'],
    responses: createApiResponse(UserResponseSchema, 'Success'),
  });

  router.post('/login', validateRequest(LoginSchema), async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findById('1');
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
    responses: createApiResponse(z.object({}), 'Success'),
  });

  router.post('/logout', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findById('1');
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

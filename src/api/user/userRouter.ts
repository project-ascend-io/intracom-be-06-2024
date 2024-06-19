import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { NewUserSchema, UserSchema } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { GetUserSchema } from '@/api/user/userValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const userRegistry = new OpenAPIRegistry();

userRegistry.register('User', UserSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(UserSchema), 'Success'),
  });

  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'get',
    path: '/users/{id}',
    tags: ['User'],
    request: { params: GetUserSchema.shape.params },
    responses: createApiResponse(UserSchema, 'Success'),
  });

  router.get('/:id', validateRequest(GetUserSchema), async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const serviceResponse = await userService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'post',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(UserSchema, 'Success'),
    request: {
      params: NewUserSchema,
      body: createPostBodyParams(NewUserSchema),
    },
  });

  router.post(
    '/',
    //validateRequest(NewUserSchema),
    async (_req: Request, res: Response) => {
      console.log('Async call');
      const serviceResponse = await userService.insertUser(_req);
      handleServiceResponse(serviceResponse, res);
    }
  );

  userRegistry.registerPath({
    method: 'post',
    path: '/signup',
    tags: ['User'],
    responses: createApiResponse(UserSchema, 'Success'),
    request: {
      params: NewUserSchema,
      body: createPostBodyParams(NewUserSchema),
    },
  });

  router.post('/signup', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.signup(_req);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

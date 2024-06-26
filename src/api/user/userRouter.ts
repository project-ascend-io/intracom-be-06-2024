import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { UserComplete, UserResponseSchema, UserSchema } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { GetUserSchema, PostUserSchema } from '@/api/user/userValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const userRegistry = new OpenAPIRegistry();

userRegistry.register('User', UserComplete);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(UserComplete), 'Success'),
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
    responses: createApiResponse(UserComplete, 'Success'),
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
    responses: createApiResponse(UserResponseSchema, 'Success'),
    request: {
      body: createPostBodyParams(UserSchema),
    },
  });

  router.post('/', validateRequest(PostUserSchema), async (_req: Request, res: Response) => {
    console.log('Async call');
    const user = PostUserSchema.shape.body.parse({ ..._req.body });
    const serviceResponse = await userService.insertUser(user);
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'post',
    path: '/signup',
    tags: ['User'],
    responses: createApiResponse(UserComplete, 'Success'),
    request: {
      params: UserSchema,
      body: createPostBodyParams(UserSchema),
    },
  });

  router.post('/signup', async (_req: Request, res: Response) => {
    const serviceResponse = await userService.signup(_req);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

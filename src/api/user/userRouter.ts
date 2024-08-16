import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { UserCompleteSchema, UserResponseSchema } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { GetUserSchema, PostAdminUserSchema, PostUserSchema } from '@/api/user/userValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { userRoles } from './userModel';

export const userRegistry = new OpenAPIRegistry();

userRegistry.register('User', UserCompleteSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/users',
    tags: ['User'],
    responses: createApiResponse(z.array(UserCompleteSchema), 'Success'),
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
    responses: createApiResponse(UserResponseSchema, 'Success'),
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
      body: createPostBodyParams(PostAdminUserSchema.shape.body),
    },
  });

  router.post('/', validateRequest(PostAdminUserSchema), async (_req: Request, res: Response) => {
    console.log('Async call');
    const user = PostAdminUserSchema.shape.body.parse({ ..._req.body });
    const serviceResponse = await userService.insertUserAndOrganization(user, userRoles.Admin);
    console.log('Service Reponse: ', serviceResponse);
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'post',
    path: '/users/signup',
    tags: ['User'],
    responses: createApiResponse(UserResponseSchema, 'Success'),
    request: {
      body: createPostBodyParams(PostUserSchema.shape.body),
    },
  });

  router.post('/signup', validateRequest(PostUserSchema), async (_req: Request, res: Response) => {
    const user = PostUserSchema.shape.body.parse({ ..._req.body });
    const serviceResponse = await userService.insertUser(user, userRoles.User);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

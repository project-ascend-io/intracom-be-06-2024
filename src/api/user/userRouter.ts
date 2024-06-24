import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { GetUserSchema, NewUserSchema, UserSchema } from '@/api/user/userModel';
import { userService } from '@/api/user/userService';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { NewUser } from './__tests__/userService.test';

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
    const id = parseInt(req.params.id as string, 10);
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

  // This creates a new signup route
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
    const newUser: NewUser = {
      email: _req.body.email,
      name: _req.body.name,
      password: _req.body.password,
      age: _req.body.age,
      confirmPassword: _req.body.confirmPassword,
    };

    const serviceResponse = await userService.signup(newUser);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

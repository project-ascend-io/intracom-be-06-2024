import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { userInviteService } from '@/api/userInvite/userInviteService';
import { GetUserInviteSchema, PostUserInviteSchema } from '@/api/userInvite/userInviteValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { UserInviteCompleteSchema } from './userInviteSchema';

export const userRegistry = new OpenAPIRegistry();

userRegistry.register('UserInvite', UserInviteCompleteSchema);

export const userRouter: Router = (() => {
  const router = express.Router();

  userRegistry.registerPath({
    method: 'get',
    path: '/user-invites',
    tags: ['UserInvite'],
    responses: createApiResponse(z.array(UserInviteCompleteSchema), 'Success'),
  });

  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userInviteService.get();
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'get',
    path: '/user-invites/{id}',
    tags: ['UserInvite'],
    request: { params: GetUserInviteSchema.shape.params },
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
  });

  router.get('/:id', validateRequest(GetUserInviteSchema), async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const serviceResponse = await userInviteService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  userRegistry.registerPath({
    method: 'post',
    path: '/user-invites',
    tags: ['UserInvite'],
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
    request: {
      body: createPostBodyParams(PostUserInviteSchema),
    },
  });

  router.post('/', validateRequest(PostUserInviteSchema), async (_req: Request, res: Response) => {
    console.log('Async call');
    const user = PostUserInviteSchema.shape.body.parse({ ..._req.body });
    const serviceResponse = await userInviteService.insert(user);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

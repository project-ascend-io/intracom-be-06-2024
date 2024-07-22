import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { userInviteService } from '@/api/userInvite/userInviteService';
import {
  GetUserbyEmailInviteSchema,
  GetUserInviteSchema,
  PostUserInviteSchema,
  UpdateUserInviteSchema,
} from '@/api/userInvite/userInviteValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { UserInviteCompleteSchema } from './userInviteSchema';

export const userInviteRegistry = new OpenAPIRegistry();

userInviteRegistry.register('User Invite', UserInviteCompleteSchema);

export const userInviteRouter: Router = (() => {
  const router = express.Router();

  userInviteRegistry.registerPath({
    method: 'get',
    path: '/user-invites',
    tags: ['User Invite'],
    responses: createApiResponse(z.array(UserInviteCompleteSchema), 'Success'),
  });

  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userInviteService.get();
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'get',
    // path: '/user-invites/{id}',
    path: '/user-invites/id/{id}',
    tags: ['User Invite'],
    request: { params: GetUserInviteSchema.shape.params },
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
  });

  // router.get('/:id'

  router.get('/id/:id', validateRequest(GetUserInviteSchema), async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const serviceResponse = await userInviteService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'get',
    path: '/user-invites/email/{email}',
    tags: ['User Invite'],
    request: { params: GetUserbyEmailInviteSchema.shape.params },
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
  });

  router.get('/email/:email', validateRequest(GetUserbyEmailInviteSchema), async (req: Request, res: Response) => {
    const email = req.params.email as string;
    const serviceResponse = await userInviteService.findByEmail(email);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'post',
    path: '/user-invites',
    tags: ['User Invite'],
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
    request: {
      body: createPostBodyParams(PostUserInviteSchema.shape.body),
    },
  });

  router.post('/', validateRequest(PostUserInviteSchema), async (_req: Request, res: Response) => {
    const userInvite = PostUserInviteSchema.shape.body.parse({ ..._req.body });
    const serviceResponse = await userInviteService.insert(userInvite);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'patch',
    path: '/user-invites/{id}',
    tags: ['User Invite'],
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
    request: {
      body: createPostBodyParams(UpdateUserInviteSchema.shape.body),
    },
  });

  router.patch('/:id', validateRequest(UpdateUserInviteSchema), async (req: Request, res: Response) => {
    const id = req.params.id as string;
    // const userInvite = await userInviteService.findById(id);
    // const userInvite = serviceRes.responseObject;
    const userInviteParams = UpdateUserInviteSchema.shape.body.parse({ ...req.body });
    const serviceResponse = await userInviteService.update(id, userInviteParams);

    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

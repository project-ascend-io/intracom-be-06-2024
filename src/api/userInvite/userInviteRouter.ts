import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { userInviteService } from '@/api/userInvite/userInviteService';
import {
  DeleteInviteByIdSchema,
  GetUserInviteByHashSchema,
  GetUserInviteSchema,
  PostUserInviteSchema,
  UpdateUserInviteByHashSchema,
  UpdateUserInviteByIdSchema,
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
    path: '/organizations/{orgId}/user-invites',
    tags: ['User Invite'],
    request: {
      params: GetUserInviteSchema.shape.params,
      query: GetUserInviteSchema.shape.query,
    },
    responses: createApiResponse(z.array(UserInviteCompleteSchema), 'Success'),
  });

  router.get('/:orgId/user-invites', validateRequest(GetUserInviteSchema), async (req: Request, res: Response) => {
    const id = req.params.orgId as string;
    const queryParams = req.query;
    const serviceResponse = await userInviteService.getInvitesByOrgId(id, queryParams);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'get',
    path: '/user-invites/{hash}',
    tags: ['User Invite'],
    request: { params: GetUserInviteByHashSchema.shape.params },
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
  });

  router.get('/:hash', validateRequest(GetUserInviteByHashSchema), async (req: Request, res: Response) => {
    const hash = req.params.hash as string;
    const serviceResponse = await userInviteService.getByhash(hash);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'post',
    path: '/organizations/{orgId}/user-invites',
    tags: ['User Invite'],
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
    request: {
      params: PostUserInviteSchema.shape.params,
      body: createPostBodyParams(PostUserInviteSchema.shape.body),
    },
  });

  router.post('/:orgId/user-invites', validateRequest(PostUserInviteSchema), async (req: Request, res: Response) => {
    const organizationId = req.params.orgId as string;
    const userEmails = PostUserInviteSchema.shape.body.parse({ ...req.body });
    const serviceResponse = await userInviteService.insertInvites(organizationId, userEmails.emails);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'patch',
    path: '/organizations/{orgId}/user-invites/{id}',
    tags: ['User Invite'],
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
    request: {
      body: createPostBodyParams(UpdateUserInviteByIdSchema.shape.body),
      params: UpdateUserInviteByIdSchema.shape.params,
    },
  });

  router.patch(
    '/:orgId/user-invites/:id',
    validateRequest(UpdateUserInviteByIdSchema),
    async (req: Request, res: Response) => {
      const id = req.params.id as string;
      const orgId = req.params.orgId as string;
      const userInviteParams = UpdateUserInviteByIdSchema.shape.body.parse({ ...req.body });
      const serviceResponse = await userInviteService.updateById(id, orgId, userInviteParams);
      handleServiceResponse(serviceResponse, res);
    }
  );

  userInviteRegistry.registerPath({
    method: 'patch',
    path: '/user-invites/{hash}',
    tags: ['User Invite'],
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
    request: {
      params: UpdateUserInviteByHashSchema.shape.params,
      body: createPostBodyParams(UpdateUserInviteByHashSchema.shape.body),
    },
  });

  router.patch('/:hash', validateRequest(UpdateUserInviteByHashSchema), async (req: Request, res: Response) => {
    const hash = req.params.hash as string;
    const userInviteParams = UpdateUserInviteByHashSchema.shape.body.parse({ ...req.body });
    const serviceResponse = await userInviteService.updateByHash(hash, userInviteParams);
    handleServiceResponse(serviceResponse, res);
  });

  userInviteRegistry.registerPath({
    method: 'delete',
    path: '/organizations/{orgId}/user-invites/{id}',
    tags: ['User Invite'],
    request: {
      params: DeleteInviteByIdSchema.shape.params,
    },
    responses: createApiResponse(UserInviteCompleteSchema, 'Success'),
  });

  router.delete(
    '/:orgId/user-invites/:id',
    validateRequest(DeleteInviteByIdSchema),
    async (req: Request, res: Response) => {
      const orgId = req.params.orgId as string;
      const id = req.params.id as string;
      const serviceResponse = await userInviteService.deleteById(id, orgId);
      handleServiceResponse(serviceResponse, res);
    }
  );

  return router;
})();

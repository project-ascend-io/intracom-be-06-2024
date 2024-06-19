import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { GetUserProfileSchema, NewUserProfileSchema, UserProfileSchema } from '@/api/userProfile/userProfileModel';
import { userProfileService } from '@/api/userProfile/userProfileService';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const userProfileRegistry = new OpenAPIRegistry();

userProfileRegistry.register('UserProfile', UserProfileSchema);

export const userProfileRouter: Router = (() => {
  const router = express.Router();

  userProfileRegistry.registerPath({
    method: 'get',
    path: '/userProfiles',
    tags: ['UserProfile'],
    responses: createApiResponse(z.array(UserProfileSchema), 'Success'),
  });

  router.get('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userProfileService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  userProfileRegistry.registerPath({
    method: 'get',
    path: '/userProfiles/{userId}',
    tags: ['UserProfile'],
    request: { params: GetUserProfileSchema.shape.params },
    responses: createApiResponse(UserProfileSchema, 'Success'),
  });

  router.get('/:id', validateRequest(GetUserProfileSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await userProfileService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  userProfileRegistry.registerPath({
    method: 'post',
    path: '/userProfiles',
    tags: ['UserProfile'],
    responses: createApiResponse(UserProfileSchema, 'Success'),
    request: {
      params: NewUserProfileSchema,
      body: createPostBodyParams(NewUserProfileSchema),
    },
  });

  router.post('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userProfileService.insertUserProfile(_req);
    handleServiceResponse(serviceResponse, res);
  });

  userProfileRegistry.registerPath({
    method: 'delete',
    path: '/userProfiles/{userId}',
    tags: ['UserProfile'],
    request: { params: GetUserProfileSchema.shape.params },
    responses: createApiResponse(UserProfileSchema, 'Success'),
  });

  router.delete('/:id', validateRequest(GetUserProfileSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await userProfileService.deleteByUserId(id);
    handleServiceResponse(serviceResponse, res);
  });

  userProfileRegistry.registerPath({
    method: 'patch',
    path: '/userProfiles/{userId}',
    tags: ['UserProfile'],
    request: { params: GetUserProfileSchema.shape.params },
    responses: createApiResponse(UserProfileSchema, 'Success'),
  });

  router.patch('/', async (_req: Request, res: Response) => {
    const serviceResponse = await userProfileService.patchUserProfile(_req);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

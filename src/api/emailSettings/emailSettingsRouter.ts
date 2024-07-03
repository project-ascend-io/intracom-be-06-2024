import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import {
  EmailSettingsSchema,
  GetEmailSettingsSchema,
  NewEmailSettingsSchema,
} from '@/api/emailSettings/emailSettingsModel';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

import { emailSettingsService } from './emailSettingsService';

export const emailSettingsRegistry = new OpenAPIRegistry();

export const emailSettingsRouter: Router = (() => {
  const router = express.Router();

  emailSettingsRegistry.registerPath({
    method: 'get',
    path: '/email-settings',
    tags: ['Email Settings'],
    responses: createApiResponse(z.array(EmailSettingsSchema), 'Success'),
  });

  router.get('/email-settings', async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.findAll();
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'get',
    path: '/email-settings/{Id}',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.get('/:id', validateRequest(GetEmailSettingsSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await emailSettingsService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'post',
    path: '/email-settings',
    tags: ['Email Settings'],
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
    request: {
      params: NewEmailSettingsSchema,
      body: createPostBodyParams(NewEmailSettingsSchema),
    },
  });

  router.post('/', async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.insertEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'delete',
    path: '/email-settings/{Id}',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.delete('/:id', validateRequest(GetEmailSettingsSchema), async (req: Request, res: Response) => {
    const id = parseInt(req.params.id as string, 10);
    const serviceResponse = await emailSettingsService.deleteByEmailSettingsId(id);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'patch',
    path: '/email-settings/{Id}',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.patch('/', async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.patchEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

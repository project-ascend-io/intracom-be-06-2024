import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { EmailSettingsSchema } from '@/api/emailSettings/emailSettingsSchema';
import { emailSettingsService } from '@/api/emailSettings/emailSettingsService';
import { GetEmailSettingsSchema } from '@/api/emailSettings/emailSettingsValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse } from '@/common/utils/httpHandlers';

export const emailSettingsRegistry = new OpenAPIRegistry();

export const emailSettingsRouter: Router = (() => {
  const router = express.Router();

  emailSettingsRegistry.registerPath({
    method: 'get',
    path: 'organizations/{id}/email-settings',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.get('/organizations/:id/email-settings', async (_req: Request, res: Response) => {
    const id = _req.params.id as string;
    const serviceResponse = await emailSettingsService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'post',
    path: '/email-settings',
    tags: ['Email Settings'],
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
    request: {
      params: EmailSettingsSchema,
      body: createPostBodyParams(EmailSettingsSchema),
    },
  });

  router.post('/', async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.insertEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'put',
    path: '/email-settings',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.put('/', async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.putEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'post',
    path: '/email-settings/test',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.post('/test', async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.testEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

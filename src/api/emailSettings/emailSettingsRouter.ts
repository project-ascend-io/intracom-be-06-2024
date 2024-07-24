import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import {
  EmailSettingsSchema,
  EmailSettingsTestSchema,
  NewEmailSettingsSchema,
} from '@/api/emailSettings/emailSettingsSchema';
import { emailSettingsService } from '@/api/emailSettings/emailSettingsService';
import {
  GetEmailSettingsSchema,
  PostEmailSettingsSchema,
  PostEmailSettingsTestSchema,
} from '@/api/emailSettings/emailSettingsValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const emailSettingsRegistry = new OpenAPIRegistry();

emailSettingsRegistry.register('EmailSettings', EmailSettingsSchema);

const nullType = z.null();

export const emailSettingsRouter: Router = (() => {
  const router = express.Router({ mergeParams: true });

  emailSettingsRegistry.registerPath({
    method: 'get',
    path: '/organizations/{id}/email-settings',
    tags: ['Email Settings'],
    request: { params: GetEmailSettingsSchema.shape.params },
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
  });

  router.get('/', validateRequest(GetEmailSettingsSchema), async (_req: Request, res: Response) => {
    const id = _req.params.id as string;
    const serviceResponse = await emailSettingsService.findById(id);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'post',
    path: '/organizations/{id}/email-settings',
    tags: ['Email Settings'],
    responses: createApiResponse(EmailSettingsSchema, 'Success'),
    request: {
      body: createPostBodyParams(NewEmailSettingsSchema),
    },
  });

  router.post('/', validateRequest(PostEmailSettingsSchema), async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.changeEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  emailSettingsRegistry.registerPath({
    method: 'post',
    path: '/organizations/{id}/email-settings/test',
    tags: ['Email Settings'],
    request: { body: createPostBodyParams(EmailSettingsTestSchema) },
    responses: createApiResponse(nullType, 'success'),
  });

  router.post('/test', validateRequest(PostEmailSettingsTestSchema), async (_req: Request, res: Response) => {
    const serviceResponse = await emailSettingsService.testEmailSettings(_req);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

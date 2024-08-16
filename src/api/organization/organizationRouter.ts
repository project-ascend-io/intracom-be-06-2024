import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { emailSettingsRouter } from '@/api/emailSettings/emailSettingsRouter';
import { BasicOrganization, OrganizationComplete, OrganizationSchema } from '@/api/organization/organizationSchema';
import { organizationService } from '@/api/organization/organizationService';
import { GetOrganizationSchema, PostOrganizationSchema } from '@/api/organization/organizationValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const organizationRegistry = new OpenAPIRegistry();

organizationRegistry.register('Organization', OrganizationSchema);

export const organizationRouter: Router = (() => {
  const router = express.Router();

  organizationRegistry.registerPath({
    method: 'post',
    path: '/organizations',
    tags: ['Organization'],
    responses: createApiResponse(OrganizationComplete, 'Success'),
    request: {
      body: createPostBodyParams(OrganizationSchema),
    },
  });

  router.post('/', validateRequest(PostOrganizationSchema), async (_req: Request, res: Response) => {
    const newOrg: BasicOrganization = { name: _req.body.name };
    const serviceResponse = await organizationService.insert(newOrg);
    return handleServiceResponse(serviceResponse, res);
  });

  organizationRegistry.registerPath({
    method: 'get',
    path: '/organizations/{id}',
    tags: ['Organization'],
    request: { params: GetOrganizationSchema.shape.params },
    responses: createApiResponse(OrganizationComplete, 'Success'),
  });

  router.get('/:id', validateRequest(GetOrganizationSchema), async (_req: Request, res: Response) => {
    const id = _req.params.id as string;
    const serviceResponse = await organizationService.findByOrgId(id);
    handleServiceResponse(serviceResponse, res);
  });

  router.use('/:id/email-settings', emailSettingsRouter);

  return router;
})();

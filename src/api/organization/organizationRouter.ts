import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { NewOrganization, NewOrganizationSchema, OrganizationSchema } from '@/api/organization/organizationSchema';
import { organizationService } from '@/api/organization/organizationService';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const organizationRegistry = new OpenAPIRegistry();

organizationRegistry.register('Organization', OrganizationSchema);
organizationRegistry.register('NewOrganization', NewOrganizationSchema);

export const organizationRouter: Router = (() => {
  const router = express.Router();

  organizationRegistry.registerPath({
    method: 'post',
    path: '/organizations',
    tags: ['Organization'],
    responses: createApiResponse(OrganizationSchema, 'Success'),
    request: {
      params: NewOrganizationSchema,
      body: createPostBodyParams(NewOrganizationSchema),
    },
  });

  router.post('/organizations', validateRequest(NewOrganizationSchema), async (_req: Request, res: Response) => {
    // throw new Error('Test!');
    const newOrg: NewOrganization = { name: _req.body.name };
    const serviceResponse = await organizationService.insert(newOrg);
    return handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

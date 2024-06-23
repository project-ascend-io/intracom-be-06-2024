import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

import { NewOrganizationSchema, Organization, OrganizationSchema } from '@/api/organization/organizationSchema';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
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

  router.post('/organization', validateRequest(NewOrganizationSchema), async (_req: Request, res: Response) => {
    const newOrg: Organization = {
      id: new mongoose.mongo.ObjectId().toString(),
      name: 'Testing',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const serviceResponse = new ServiceResponse<Organization>(
      ResponseStatus.Success,
      'Organization created.',
      newOrg,
      StatusCodes.OK
    );
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

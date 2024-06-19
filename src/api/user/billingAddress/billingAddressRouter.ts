import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { BillingAddressSchema, NewBillingAddressSchema } from '@/api/user/billingAddress/billingAddressModel';
import { billingAddressService } from '@/api/user/billingAddress/billingAddressService';
import { createPostApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validatePostRequest } from '@/common/utils/httpHandlers';

export const billingAddressRegistry = new OpenAPIRegistry();

billingAddressRegistry.register('BillingAddress', BillingAddressSchema);

export const billingAddressRouter: Router = (() => {
  const router = express.Router();

  billingAddressRegistry.registerPath({
    method: 'post',
    path: '/users/billing-address',
    tags: ['BillingAddress'],
    responses: createPostApiResponse(BillingAddressSchema, 'Success'),
    request: {
      params: NewBillingAddressSchema,
      body: createPostBodyParams(NewBillingAddressSchema),
    },
  });

  router.post('/', validatePostRequest(BillingAddressSchema), async (_req: Request, res: Response) => {
    const serviceResponse = await billingAddressService.insertBillingAddress(_req.body);
    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

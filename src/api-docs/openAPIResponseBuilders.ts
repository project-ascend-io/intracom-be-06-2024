import { ResponseConfig } from '@asteasolutions/zod-to-openapi';
import { StatusCodes } from 'http-status-codes';
import { z } from 'zod';

import { ApiResponseConfig } from '@/common/models/openAPIResponseConfig';
import { ServiceResponseSchema } from '@/common/models/serviceResponse';

export function createApiResponse(schema: z.ZodTypeAny, description: string, statusCode = StatusCodes.OK) {
  return {
    [statusCode]: {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema),
        },
      },
    },
  };
}

export function createPostBodyParams(zodSchema: z.ZodTypeAny) {
  return {
    content: {
      'application/json': {
        schema: zodSchema,
      },
    },
  };
}

export function createApiResponses(configs: ApiResponseConfig[]) {
  const responses: { [key: string]: ResponseConfig } = {};
  configs.forEach(({ schema, description, statusCode }) => {
    responses[statusCode] = {
      description,
      content: {
        'application/json': {
          schema: ServiceResponseSchema(schema),
        },
      },
    };
  });
  return responses;
}

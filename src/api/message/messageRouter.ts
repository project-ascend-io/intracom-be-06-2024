import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';
import { z } from 'zod';

import { MessageSchema, NewMessage } from '@/api/message/messageSchema';
import { messageService } from '@/api/message/messageService';
import { GetMessageSchema, PostMessageSchema } from '@/api/message/messageValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const messageRegistry = new OpenAPIRegistry();

messageRegistry.register('Message', MessageSchema);

export const messageRouter: Router = (() => {
  const router = express.Router();

  messageRegistry.registerPath({
    method: 'get',
    path: '/messages/{id}',
    tags: ['Message'],
    responses: createApiResponse(z.array(MessageSchema), 'Success'),
    request: {
      params: GetMessageSchema,
    },
  });

  router.get('/:id', validateRequest(GetMessageSchema), async (req: Request, res: Response) => {
    const { id } = req.params;
    const serviceResponse = await messageService.getMessages(id);

    handleServiceResponse(serviceResponse, res);
  });

  messageRegistry.registerPath({
    method: 'post',
    path: '/messages',
    tags: ['Message'],
    responses: createApiResponse(MessageSchema, 'Success'),
    request: {
      body: createPostBodyParams(PostMessageSchema),
    },
  });

  router.post('/', validateRequest(PostMessageSchema), async (req: Request, res: Response) => {
    const newMessage: NewMessage = MessageSchema.parse(req.body);
    const serviceResponse = await messageService.postMessage(newMessage);

    handleServiceResponse(serviceResponse, res);
  });

  return router;
})();

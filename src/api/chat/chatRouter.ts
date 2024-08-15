import { OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import express, { Request, Response, Router } from 'express';

import { ChatSchema } from '@/api/chat/chatSchema';
import { chatService } from '@/api/chat/chatService';
import { GetChatSchema, PostChatSchema } from '@/api/chat/chatValidation';
import { createApiResponse, createPostBodyParams } from '@/api-docs/openAPIResponseBuilders';
import { handleServiceResponse, validateRequest } from '@/common/utils/httpHandlers';

export const chatRegistry = new OpenAPIRegistry();

chatRegistry.register('Chat', ChatSchema);

export const chatRouter: Router = (() => {
  const router = express.Router();

  chatRegistry.registerPath({
    method: 'post',
    path: '/chats',
    tags: ['Chat'],
    request: { body: createPostBodyParams(PostChatSchema) },
    responses: createApiResponse(ChatSchema, 'Success'),
  });

  router.post('/', validateRequest(PostChatSchema), async (req: Request, res: Response) => {
    const serviceResponse = await chatService.createChat(req);
    handleServiceResponse(serviceResponse, res);
  });

  chatRegistry.registerPath({
    method: 'get',
    path: '/chats/{id}',
    tags: ['Chat'],
    request: { params: GetChatSchema.shape.params },
    responses: createApiResponse(ChatSchema, 'Success'),
  });

  router.get('/:id', validateRequest(GetChatSchema), async (req: Request, res: Response) => {
    const serviceResponse = await chatService.findAll(req);
    handleServiceResponse(serviceResponse, res);
  });
  return router;
})();

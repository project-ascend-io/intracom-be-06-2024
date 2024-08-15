import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { messageRepository } from '@/api/message/messageRepository';
import { Message, MessageSchema, NewMessage } from '@/api/message/messageSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

export const messageService = {
  getMessages: async (req: Request): Promise<ServiceResponse<Message[] | null>> => {
    try {
      const chatId = req.params.id;
      const messages = await messageRepository.findByIdAsync(chatId);

      if (!messages) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          `Messages not found for chat id: ${chatId}`,
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return new ServiceResponse<Message[]>(ResponseStatus.Success, 'Messages found', messages, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `Error getting messages: $${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  postMessage: async (req: Request): Promise<ServiceResponse<Message | null>> => {
    try {
      const newMessage: NewMessage = MessageSchema.parse(req.body);
      const message = await messageRepository.insertMessageAsync(newMessage);

      return new ServiceResponse<Message>(
        ResponseStatus.Success,
        'Messages inserted successfuly',
        message,
        StatusCodes.OK
      );
    } catch (err) {
      const errorMessage = `Error inserting message: ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

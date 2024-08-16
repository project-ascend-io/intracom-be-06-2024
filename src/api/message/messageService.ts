import { StatusCodes } from 'http-status-codes';

import { messageRepository } from '@/api/message/messageRepository';
import { Message, NewMessage } from '@/api/message/messageSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

export const messageService = {
  getMessages: async (id: string): Promise<ServiceResponse<Message[] | null>> => {
    try {
      const messages = await messageRepository.findByIdAsync(id);

      if (!messages) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          `Messages not found for chat id: ${id}`,
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

  postMessage: async (newMessage: NewMessage): Promise<ServiceResponse<Message | null>> => {
    try {
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

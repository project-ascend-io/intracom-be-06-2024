import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { chatRepository } from './chatRepository';
import { Chat, NewChat } from './chatSchema';

export const chatService = {
  findAll: async (userId: string): Promise<ServiceResponse<Chat[] | null>> => {
    try {
      const chats = await chatRepository.findAllAsync(userId);

      if (!chats) {
        return new ServiceResponse<null>(
          ResponseStatus.Failed,
          `Chats not found for user id: ${userId}`,
          null,
          StatusCodes.NOT_FOUND
        );
      }

      return new ServiceResponse<Chat[]>(ResponseStatus.Success, 'Chats found', chats, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `Error getting chats: ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  createChat: async (recipientId: string, creatorId: string): Promise<ServiceResponse<Chat | NewChat | null>> => {
    try {
      const chat = await chatRepository.accessChatAsync(recipientId, creatorId);

      if (!chat) {
        return new ServiceResponse<null>(ResponseStatus.Failed, 'Chat not created', null, StatusCodes.NOT_FOUND);
      }

      return new ServiceResponse<Chat>(ResponseStatus.Success, 'Chat created successfully', chat, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `Error creating chat: ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

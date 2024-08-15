import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { chatRepository } from './chatRepository';
import { Chat, NewChat } from './chatSchema';

export const chatService = {
  findAll: async (req: Request): Promise<ServiceResponse<Chat[] | null>> => {
    try {
      const userId = req.params.id;
      const chats = await chatRepository.findAllAsync(userId);

      if (!chats) {
        return new ServiceResponse(
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

  createChat: async (req: Request): Promise<ServiceResponse<Chat | NewChat | null>> => {
    try {
      const { recipientId, creatorId } = req.body;
      const chat = await chatRepository.accessChatAsync(recipientId, creatorId);

      return new ServiceResponse<Chat>(ResponseStatus.Success, 'Chat created successfuly', chat, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `Error creating chat: ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};
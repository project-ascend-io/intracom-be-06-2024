import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import { messageRepository } from '@/api/message/messageRepository';
import { Message } from '@/api/message/messageSchema';
import { messageService } from '@/api/message/messageService';

vi.mock('@/api/message/messageRepository');
vi.mock('@server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('messageService', () => {
  const mockMessages: Message[] = [
    {
      _id: '618g2f8gfd56sgfdsg',
      sender: new mongoose.mongo.ObjectId('66906ca8fa6f594ee9c2d67b'),
      content: 'Hello.',
      chat: new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
    },
    {
      _id: '65fdfad5f65dsafsdf',
      sender: new mongoose.mongo.ObjectId('66b14242e9a75ff13a66027a'),
      content: 'Hi. How are you?',
      chat: new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
    },
    {
      _id: '65ncfad5iyjdsaf8d5',
      sender: new mongoose.mongo.ObjectId('66906ca8fa6f594ee9c2d67b'),
      content: 'Is this finished yet?',
      chat: new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
    },
  ];

  const mockNewMessage: Message = {
    _id: '65fdfad5f65dsafsdf',
    sender: new mongoose.mongo.ObjectId('66b14242e9a75ff13a66027a'),
    content: 'Hi. How are you?',
    chat: new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
  };

  it('should return a list of messages', async () => {
    // Arrange
    vi.spyOn(messageRepository, 'findByIdAsync').mockReturnValue(Promise.resolve(mockMessages));

    // Act
    const response = await messageService.getMessages('65fdfad5f65dsafsdf');

    // Assert
    expect(response.success).toBe(true);
    expect(response.message).toBe('Messages found');
    expect(response.responseObject).toBe(mockMessages);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('should return an error response when messages retrieval fails', async () => {
    // Arrange
    vi.spyOn(messageRepository, 'findByIdAsync').mockReturnValue(Promise.resolve(null));

    // Act
    const response = await messageService.getMessages('65fdfad98474646safsdf');

    // Assert
    expect(response.success).toBe(false);
    expect(response.message).toBe('Messages not found for chat id: 65fdfad98474646safsdf');
    expect(response.responseObject).toBeNull();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });

  it('should return the new message that was created', async () => {
    // Arrange
    vi.spyOn(messageRepository, 'insertMessageAsync').mockReturnValue(Promise.resolve(mockNewMessage));

    // Act
    const newMessage = {
      sender: '66b14242e9a75ff13a66027a',
      content: 'Hi. How are you?',
      chat: '66b69114935161d476b3bc3b',
    };
    const response = await messageService.postMessage(newMessage);

    // Assert
    expect(response.success).toBe(true);
    expect(response.message).toBe('Message inserted successfully');
    expect(response.responseObject).toBe(mockNewMessage);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });

  it('should return an error response when creating a message fails', async () => {
    // Arrange
    vi.spyOn(messageRepository, 'insertMessageAsync').mockReturnValue(Promise.resolve(null));

    // Act
    const newMessage = {
      sender: '66b14242e9a75ff13a66027a',
      content: 'Hi. How are you?',
      chat: '66b69114935161d476b3bc3b',
    };
    const response = await messageService.postMessage(newMessage);

    // Assert
    expect(response.success).toBe(false);
    expect(response.message).toBe('Message was not created');
    expect(response.responseObject).toBeNull();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});

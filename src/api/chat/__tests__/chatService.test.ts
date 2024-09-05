import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import { chatRepository } from '@/api/chat/chatRepository';
import { Chat } from '@/api/chat/chatSchema';
import { chatService } from '@/api/chat/chatService';

vi.mock('@/api/chat/chatRepository');
vi.mock('@server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('chatService', () => {
  const mockChats: Chat[] = [
    {
      _id: '65fdfad5f65dsafsdf',
      chatName: 'John Doe',
      isChannel: false,
      users: [
        new mongoose.mongo.ObjectId('66b14242e9a75ff13a66027a'),
        new mongoose.mongo.ObjectId('66b14242e9a75ff13a66027b'),
      ],
      chatAdmin: null,
    },
    {
      _id: '65fdfbn5f65dsafxdi',
      chatName: 'Jane Doe',
      isChannel: false,
      users: [
        new mongoose.mongo.ObjectId('66906ca8fa6f594ee9c2d67b'),
        new mongoose.mongo.ObjectId('66906ca8fa6f594ee9c2d67b'),
      ],
      chatAdmin: null,
    },
  ];
  const mockNewChat: Chat = {
    _id: '65fdfad5f65dsafsdf',
    chatName: 'John Doe',
    isChannel: false,
    users: [
      new mongoose.mongo.ObjectId('66906ca8fa6f594ee9c2d67b'),
      new mongoose.mongo.ObjectId('66906ca8fa6f594ee9c2d67b'),
    ],
    chatAdmin: null,
  };

  it('should return a list of chats', async () => {
    // Arrange
    vi.spyOn(chatRepository, 'findAllAsync').mockReturnValue(Promise.resolve(mockChats));

    // Act
    const response = await chatService.findAll('66b14242e9a75ff13a66027b');

    // Assert
    expect(response.success).toBe(true);
    expect(response.message).toBe('Chats found');
    expect(response.responseObject).toBe(mockChats);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });
  it('should return an error response when chats retrieval fails', async () => {
    // Arrange
    vi.spyOn(chatRepository, 'findAllAsync').mockReturnValue(Promise.resolve(null));

    // Act
    const response = await chatService.findAll('66b14242e9a75ff13a66027b');

    // Assert
    expect(response.success).toBe(false);
    expect(response.message).toBe('Chats not found for user id: 66b14242e9a75ff13a66027b');
    expect(response.responseObject).toBe(null);
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
  it('should return the new chat that was created', async () => {
    // Arrange
    vi.spyOn(chatRepository, 'accessChatAsync').mockReturnValue(Promise.resolve(mockNewChat));

    // Act
    const response = await chatService.createChat('66b14242e9a75ff13a66027b', '66b14242e9a75ff13a66027b');

    // Assert
    expect(response.success).toBe(true);
    expect(response.message).toBe('Chat created successfully');
    expect(response.responseObject).toBe(mockNewChat);
    expect(response.statusCode).toBe(StatusCodes.OK);
  });
  it('should return an error response when creating a chat fails', async () => {
    // Arrange
    vi.spyOn(chatRepository, 'accessChatAsync').mockReturnValue(Promise.resolve(null));

    // Act
    const response = await chatService.createChat('66b14242e9a75ff13a66027b', '66b14242e9a75ff13a66027b');

    // Assert
    expect(response.success).toBe(false);
    expect(response.message).toBe('Chat not created');
    expect(response.responseObject).toBeNull();
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
  });
});

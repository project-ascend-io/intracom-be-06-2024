import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { Chat, NewChat } from '@/api/chat/chatSchema';
import { chatService } from '@/api/chat/chatService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

describe('chatRouter', () => {
  vi.mock('@/api/chat/chatService');
  const mockChats: Chat[] = [
    {
      _id: '65fdfad5f65dsafsdf',
      chatName: 'John Doe',
      isChannel: false,
      users: [
        new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
        new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
      ],
      chatAdmin: null,
    },
    {
      _id: '65fdfbn5f65dsafxdi',
      chatName: 'Jane Doe',
      isChannel: false,
      users: [
        new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
        new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
      ],
      chatAdmin: null,
    },
  ];
  const mockNewChat: Chat = {
    _id: '65fdfad5f65dsafsdf',
    chatName: 'John Doe',
    isChannel: false,
    users: [
      new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
      new mongoose.mongo.ObjectId('66b69114935161d476b3bc3b'),
    ],
    chatAdmin: null,
  };

  const mockChatServiceChatCreationResponse: ServiceResponse<Chat> = {
    success: true,
    message: 'Chat created successfully',
    responseObject: mockNewChat,
    statusCode: StatusCodes.OK,
  };

  const mockChatServiceFindAllChatsResponse: ServiceResponse<Chat[]> = {
    success: true,
    message: 'Chats found',
    responseObject: mockChats,
    statusCode: StatusCodes.OK,
  };

  const mockChatServiceError: ServiceResponse<null> = {
    success: false,
    message: 'Chats not found for user id: 66b69114935161d476b3bc3b',
    responseObject: null,
    statusCode: StatusCodes.NOT_FOUND,
  };

  it('should return a service response with a list of chats', async () => {
    // Arrange
    vi.spyOn(chatService, 'findAll').mockReturnValue(Promise.resolve(mockChatServiceFindAllChatsResponse));

    // Act
    const response = await request(app).get('/chats/66b14242e9a75ff13a66027b');
    const responseBody: ServiceResponse<Chat[]> = response.body;
    // Convert ObjectId instances to strings for comparison
    const expectedChats = mockChatServiceFindAllChatsResponse.responseObject.map((chat) => ({
      ...chat,
      users: chat.users.map((user) => user.toString()),
    }));
    responseBody.responseObject.map((chat) => ({
      ...chat,
      users: chat.users.map((user) => user.toString()),
    }));

    // Assert
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.message).toBe('Chats found');
    expect(responseBody.responseObject).toEqual(expectedChats);
  });

  it('should handle an error response when chats retrieval fails', async () => {
    // Arrange
    vi.spyOn(chatService, 'findAll').mockReturnValue(Promise.resolve(mockChatServiceError));

    // Act
    const response = await request(app).get('/chats/66b69114935161d476b3bc3b');
    const responseBody: ServiceResponse<null> = response.body;

    // Assert
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(responseBody.success).toBeFalsy();
    expect(responseBody.message).toBe('Chats not found for user id: 66b69114935161d476b3bc3b');
    expect(responseBody.responseObject).toEqual(null);
  });

  it('should return a service response with a single chat', async () => {
    // Arrange
    vi.spyOn(chatService, 'createChat').mockReturnValue(Promise.resolve(mockChatServiceChatCreationResponse));

    // Act
    const response = await request(app)
      .post('/chats')
      .send({ recipientId: '66b69114935161d476b3bc3b', creatorId: '66b69114935161d476b3bc3b' });
    const responseBody: ServiceResponse<NewChat> = response.body;
    // Convert ObjectId instances to strings for comparison
    const expectedChat = {
      chatName: mockNewChat.chatName,
      isChannel: mockNewChat.isChannel,
      users: mockNewChat.users.map((user) => user.toString()),
      chatAdmin: mockNewChat.chatAdmin,
    };
    responseBody.responseObject = {
      chatName: responseBody.responseObject.chatName,
      isChannel: responseBody.responseObject.isChannel,
      users: responseBody.responseObject.users.map((user) => user.toString()) as any,
      chatAdmin: responseBody.responseObject.chatAdmin,
    };

    // Assert
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.message).toBe('Chat created successfully');
    expect(responseBody.responseObject).toEqual(expectedChat);
  });

  it('should handle an error response when chat creation fails', async () => {
    // Arrange
    vi.spyOn(chatService, 'createChat').mockReturnValue(Promise.resolve(mockChatServiceError));

    // Act
    const response = await request(app)
      .post('/chats')
      .send({ recipientId: '66b69114935161d476b3bc3b', creatorId: '66b69114935161d476b3bc3b' });
    const responseBody: ServiceResponse<null> = response.body;

    // Assert
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(responseBody.success).toBeFalsy();
    expect(responseBody.message).toBe('Chats not found for user id: 66b69114935161d476b3bc3b');
    expect(responseBody.responseObject).toEqual(null);
  });
});

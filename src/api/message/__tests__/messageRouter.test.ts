import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { Message, NewMessage } from '@/api/message/messageSchema';
import { messageService } from '@/api/message/messageService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

describe('messageRouter', () => {
  vi.mock('@/api/message/messageService');
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

  const mockMessageServiceSingleMessageResponse: ServiceResponse<Message> = {
    success: true,
    message: 'Messages inserted successfully',
    responseObject: mockNewMessage,
    statusCode: StatusCodes.OK,
  };

  const mockMessageServiceMultipleMessagesResponse: ServiceResponse<Message[]> = {
    success: true,
    message: 'Messages found',
    responseObject: mockMessages,
    statusCode: StatusCodes.OK,
  };

  const mockMessageServiceError: ServiceResponse<null> = {
    success: false,
    message: 'Messages not found for chat id: 66b69114935161d476b3bc3b',
    responseObject: null,
    statusCode: StatusCodes.NOT_FOUND,
  };

  it('should return a service response with a list of messages', async () => {
    // Arrange
    vi.spyOn(messageService, 'getMessages').mockReturnValue(
      Promise.resolve(mockMessageServiceMultipleMessagesResponse)
    );

    // Act
    const response = await request(app).get('/messages/66b69114935161d476b3bc3b');
    const responseBody: ServiceResponse<Message[]> = response.body;
    // Convert ObjectId instances to strings for comparison
    const expectedMessages = mockMessages.map((msg) => ({
      ...msg,
      sender: msg.sender.toString(),
      chat: msg.chat.toString(),
    }));
    responseBody.responseObject.map((msg) => ({
      ...msg,
      sender: msg.sender.toString(),
      chat: msg.chat.toString(),
    }));

    // Assert
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.message).toBe('Messages found');
    expect(responseBody.responseObject).toEqual(expectedMessages);
  });

  it('should handle an error response when messages retrieval fails', async () => {
    // Arrange
    vi.spyOn(messageService, 'getMessages').mockReturnValue(Promise.resolve(mockMessageServiceError));

    // Act
    const response = await request(app).get('/messages/66b69114935161d476b3bc3b');
    const responseBody: ServiceResponse<null> = response.body;

    // Assert
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(responseBody.success).toBeFalsy();
    expect(responseBody.responseObject).toBeNull();
    expect(responseBody.message).toBe('Messages not found for chat id: 66b69114935161d476b3bc3b');
  });

  it('should return a service response with a single message', async () => {
    // Arrange
    vi.spyOn(messageService, 'postMessage').mockReturnValue(Promise.resolve(mockMessageServiceSingleMessageResponse));

    // Act
    const newMessage: NewMessage = {
      sender: '66906ca8fa6f594ee9c2d67b',
      content: 'Is this finished yet?',
      chat: '66b69114935161d476b3bc3b',
    };
    const response = await request(app).post('/messages').send(newMessage).set('Accept', 'application/json');
    const responseBody: ServiceResponse<NewMessage> = response.body;
    // Convert ObjectId instances to strings for comparison
    const expectedMessage = {
      sender: mockNewMessage.sender.toString(),
      content: mockNewMessage.content,
      chat: mockNewMessage.chat.toString(),
    };
    responseBody.responseObject = {
      sender: responseBody.responseObject.sender.toString(),
      content: responseBody.responseObject.content,
      chat: responseBody.responseObject.chat.toString(),
    };

    // Assert
    expect(response.statusCode).toBe(StatusCodes.OK);
    expect(responseBody.success).toBeTruthy();
    expect(responseBody.message).toBe('Messages inserted successfully');
    expect(responseBody.responseObject).toEqual(expectedMessage);
  });

  it('should handle an error response when message insertion fails', async () => {
    // Arrange
    vi.spyOn(messageService, 'postMessage').mockReturnValue(Promise.resolve(mockMessageServiceError));

    // Act
    const newMessage: NewMessage = {
      sender: '66906ca8fa6f594ee9c2d67b',
      content: 'Is this finished yet?',
      chat: '66b69114935161d476b3bc3b',
    };
    const response = await request(app).post('/messages').send(newMessage).set('Accept', 'application/json');
    const responseBody: ServiceResponse<NewMessage> = response.body;

    // Assert
    expect(response.statusCode).toBe(StatusCodes.NOT_FOUND);
    expect(responseBody.success).toBeFalsy();
    expect(responseBody.responseObject).toBeNull();
    expect(responseBody.message).toBe('Messages not found for chat id: 66b69114935161d476b3bc3b');
  });
});

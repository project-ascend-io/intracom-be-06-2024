import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, Mock, TestContext, vi } from 'vitest';
import { z } from 'zod';

import { NewUserSchema, User } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('../userService', () => ({
  userService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    insertUser: vi.fn(),
    signup: vi.fn(),
  },
}));

type NewUser = z.infer<typeof NewUserSchema>;

interface UserTaskContext {
  userList: User[];
}

type UserEndpointTestContext = TestContext & UserTaskContext;

describe('User API Endpoints', () => {
  beforeEach(async (context: UserEndpointTestContext) => {
    const userList: User[] = [];
    for (let i: number = 0; i < 10; i++) {
      const objectId = new mongoose.mongo.ObjectId();
      const prefix = `johndoe+${i}`;
      userList.push({
        id: objectId.toString(),
        email: prefix + '@gmail.com',
        username: prefix,
        password: 'testing123!',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    context.userList = userList;
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('GET /users', () => {
    it('should return a list of users', async ({ userList }: UserEndpointTestContext) => {
      const responseMock = new ServiceResponse<User[]>(ResponseStatus.Success, 'Users found', userList, StatusCodes.OK);
      (userService.findAll as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).get('/users');
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Users found');
      expect(responseBody.responseObject.length).toEqual(userList.length);
      responseBody.responseObject.forEach((user, index) => compareUsers(userList[index] as User, user));
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user for a valid ID', async ({ userList }: UserEndpointTestContext) => {
      // Arrange
      const testId = userList['1'].id;
      const expectedUser = userList.find((user: User) => user.id === testId) as User;

      const responseMock = new ServiceResponse<User>(
        ResponseStatus.Success,
        'User found',
        expectedUser,
        StatusCodes.OK
      );
      (userService.findById as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse<User> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('User found');
      if (!expectedUser) throw new Error('Invalid test data: expectedUser is undefined');
      compareUsers(expectedUser, responseBody.responseObject);
    });

    it('should return a not found error for non-existent ID', async () => {
      // Arrange
      const objectId = new mongoose.mongo.ObjectId();

      const responseMock = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'User not found',
        null,
        StatusCodes.NOT_FOUND
      );

      (userService.findById as Mock).mockReturnValue(responseMock);
      // Act
      const response = await request(app).get(`/users/${objectId.toString()}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('User not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Act
      const invalidInput = 1;
      const response = await request(app).get(`/users/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('POST /users', () => {
    it('should return the newly created user', async () => {
      // Act
      const newUser: NewUser = {
        email: 'newUser@gmail.com',
        password: 'Testing123!',
        username: 'newUser',
      };

      const responseMock = new ServiceResponse<NewUser>(
        ResponseStatus.Success,
        'User created.',
        newUser,
        StatusCodes.OK
      );
      (userService.signup as Mock).mockReturnValue(responseMock);

      // Assert
      const response = await request(app).post(`/users`).send(newUser).set('Accept', 'application/json');

      expect(response.statusCode).toEqual(StatusCodes.OK);
      // const responseBody: ServiceResponse<NewUser> = response.body;
      // expect(responseBody.message).toContain('User created.');
      // expect(responseBody.responseObject).toMatchObject({
      //   email: 'newUser@gmail.com',
      //   username: 'newUser',
      // });
    });
  });
});

function compareUsers(mockUser: User, responseUser: User) {
  if (!mockUser || !responseUser) {
    throw new Error('Invalid test data: mockUser or responseUser is undefined');
  }

  expect(responseUser.id).toEqual(mockUser.id);
  expect(responseUser.username).toEqual(mockUser.username);
  expect(responseUser.email).toEqual(mockUser.email);
  expect(new Date(responseUser.createdAt)).toEqual(mockUser.createdAt);
  expect(new Date(responseUser.updatedAt)).toEqual(mockUser.updatedAt);
}

import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, Mock, TestContext, vi } from 'vitest';

import { User, UserResponse } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { PostAdminUser, PostUser } from '@/api/user/userValidation';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { userRoles } from '../userModel';

vi.mock('../userService', () => ({
  userService: {
    findAll: vi.fn(),
    findById: vi.fn(),
    insertUserAndOrganization: vi.fn(),
    signup: vi.fn(),
    insertUser: vi.fn(),
  },
}));

vi.mock('../userRepository', () => ({
  userRepository: {
    insertUserAndOrganization: vi.fn(),
    insertUser: vi.fn(),
  },
}));
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
        _id: objectId,
        email: prefix + '@gmail.com',
        username: prefix,
        organization: new mongoose.mongo.ObjectId(),
        password: 'testing123!',
        role: 'Admin',
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
      const testId = userList['1']._id;
      const user = userList.find((user: User) => user._id === testId) as User;
      const expectedUser: UserResponse = {
        _id: user._id,
        email: user.email,
        username: user.username,
        role: userRoles.Admin,
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'Beach Front',
        },
      };

      const responseMock = new ServiceResponse<UserResponse>(
        ResponseStatus.Success,
        'User found',
        expectedUser,
        StatusCodes.OK
      );
      (userService.findById as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse<UserResponse> = response.body;

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
    it('should return password does not pass complexity', async () => {
      // Act
      const newUser: PostUser = {
        hash: 'newUser@gmail.com',
        password: 'testing',
        username: 'newUser',
      };
      // Assert
      const response = await request(app).post(`/users`).send(newUser).set('Accept', 'application/json');

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
    });
    it('should return the newly created user', async () => {
      // Act
      const newUser: PostAdminUser = {
        email: 'newUser@gmail.com',
        password: 'Testing123!',
        username: 'newUser',
        organization: 'Example Corp.',
      };

      const userResponse = {
        _id: new mongoose.mongo.ObjectId(),
        ...newUser,
        role: userRoles.Admin,
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'Example Corp.',
        },
      };

      const responseMock = new ServiceResponse<UserResponse>(
        ResponseStatus.Success,
        'User created.',
        userResponse,
        StatusCodes.CREATED
      );
      (userService.insertUserAndOrganization as Mock).mockReturnValue(responseMock);

      // Assert
      const response = await request(app).post(`/users`).send(newUser).set('Accept', 'application/json');

      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      const responseBody: ServiceResponse<UserResponse> = response.body;
      expect(responseBody.message).toContain('User created.');
      expect(responseBody.responseObject).toMatchObject({
        email: 'newUser@gmail.com',
        username: 'newUser',
      });
    });
  });

  describe('POST /signup', () => {
    it('should return user created', async () => {
      // Act
      const newUser: PostUser = {
        hash: 'ef7ab856499e3207f51',
        username: 'newUser@gmail.com',
        password: 'Testing123!',
      };

      const userResponse = {
        _id: new mongoose.mongo.ObjectId(),
        username: newUser.username,
        email: newUser.username,
        role: userRoles.User,
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'Example Corp.',
        },
      };

      const responseMock = new ServiceResponse<UserResponse>(
        ResponseStatus.Success,
        'User created.',
        userResponse,
        StatusCodes.CREATED
      );
      (userService.insertUser as Mock).mockReturnValue(responseMock);

      // Assert
      const response = await request(app).post(`/users/signup`).send(newUser);

      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      const responseBody: ServiceResponse<UserResponse> = response.body;
      expect(responseBody.message).toContain('User created.');
      expect(responseBody.responseObject).toMatchObject({
        email: 'newUser@gmail.com',
        username: 'newUser@gmail.com',
        role: userRoles.User,
      });
    });
    it('should return User invite not found', async () => {
      // Act
      const newUser: PostUser = {
        hash: 'ef7ab856499e3207f51',
        username: 'newUser@gmail.com',
        password: 'Testing123!',
      };

      const responseMock = new ServiceResponse<UserResponse | null>(
        ResponseStatus.Failed,
        'User invite not found',
        null,
        StatusCodes.UNAUTHORIZED
      );
      (userService.insertUser as Mock).mockReturnValue(responseMock);

      // Assert
      const response = await request(app).post(`/users/signup`).send(newUser);

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      const responseBody: ServiceResponse<UserResponse> = response.body;
      expect(responseBody.message).toContain('User invite not found');
      expect(responseBody.responseObject).toBe(null);
    });
    it('should return User invite expired', async () => {
      // Act
      const newUser: PostUser = {
        hash: 'ef7ab856499e3207f51',
        username: 'newUser@gmail.com',
        password: 'Testing123!',
      };

      const responseMock = new ServiceResponse<UserResponse | null>(
        ResponseStatus.Failed,
        'User invite expired',
        null,
        StatusCodes.UNAUTHORIZED
      );
      (userService.insertUser as Mock).mockReturnValue(responseMock);

      // Assert
      const response = await request(app).post(`/users/signup`).send(newUser);

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      const responseBody: ServiceResponse<UserResponse> = response.body;
      expect(responseBody.message).toContain('User invite expired');
      expect(responseBody.responseObject).toBe(null);
    });
    it('should return User already exists', async () => {
      // Act
      const newUser: PostUser = {
        hash: 'ef7ab856499e3207f51',
        username: 'newUser@gmail.com',
        password: 'Testing123!',
      };

      const responseMock = new ServiceResponse<UserResponse | null>(
        ResponseStatus.Failed,
        'User invite already exists',
        null,
        StatusCodes.UNAUTHORIZED
      );
      (userService.insertUser as Mock).mockReturnValue(responseMock);

      // Assert
      const response = await request(app).post(`/users/signup`).send(newUser);

      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      const responseBody: ServiceResponse<UserResponse> = response.body;
      expect(responseBody.message).toContain('User invite already exists');
      expect(responseBody.responseObject).toBe(null);
    });
  });

  function compareUsers(mockUser: User | UserResponse, responseUser: User | UserResponse) {
    if (!mockUser || !responseUser) {
      throw new Error('Invalid test data: mockUser or responseUser is undefined');
    }

    expect(responseUser._id.toString()).toEqual(mockUser._id.toString());
    expect(responseUser.username).toEqual(mockUser.username);
    expect(responseUser.email).toEqual(mockUser.email);
  }
});

import bcrypt from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, Mock, TestContext, vi } from 'vitest';

import { authService } from '@/api/auth/authService';
import { User, UserResponse } from '@/api/user/userSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('../authService', () => ({
  authService: {
    login: vi.fn(),
  },
}));

interface AuthTaskContext {
  userList: User[];
}

type AuthEndpointTestContext = TestContext & AuthTaskContext;
describe('Authentication API endpoints', () => {
  beforeEach(async (context: AuthEndpointTestContext) => {
    const userList: User[] = [];
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash('Testing123!', salt);
    for (let i: number = 0; i < 3; i++) {
      const objectId = new mongoose.mongo.ObjectId();
      const prefix = `johndoe+${i}`;
      userList.push({
        _id: objectId.toString(),
        email: prefix + '@gmail.com',
        username: prefix,
        organization: {
          _id: new mongoose.mongo.ObjectId().toString(),
          name: `Ebook Store #${i}`,
        },
        password: encryptedPassword,
        role: 'Admin',
      });
    }
    context.userList = userList;
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  describe('POST /auth/login', () => {
    it('should return invalid request', async () => {
      const response = await request(app).post('/auth/login').send({}).set('Accept', 'application/json');
      const result: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toEqual('Invalid input: Email Required. Password Required.');
    });

    it('should return invalid credentials', async () => {
      const responseMock = new ServiceResponse<null>(
        ResponseStatus.Failed,
        'Invalid Credentials',
        null,
        StatusCodes.UNAUTHORIZED
      );
      (authService.login as Mock).mockReturnValue(responseMock);
      const credentials = {
        email: 'random@gmail.com',
        password: 'Testing123!',
      };

      const response = await request(app).post('/auth/login').send(credentials).set('Accept', 'application/json');
      const result: ServiceResponse = response.body;

      console.log(result);
      expect(response.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(result.success).toBeFalsy();
      expect(result.responseObject).toBeNull();
      expect(result.message).toEqual('Invalid Credentials');
    });

    it('should return successfully logged in', async ({ userList }: TestContext) => {
      const selectedUser = userList[0];
      const userResponse: UserResponse = {
        _id: selectedUser._id,
        email: selectedUser.email,
        username: selectedUser.username,
        role: selectedUser.role,
        organization: {
          _id: selectedUser.organization._id,
          name: selectedUser.organization.name,
        },
      };
      const responseMock = new ServiceResponse<UserResponse>(
        ResponseStatus.Success,
        'Successfully logged in',
        userResponse,
        StatusCodes.OK
      );
      (authService.login as Mock).mockReturnValue(responseMock);
      const credentials = {
        email: selectedUser.email,
        password: selectedUser.password,
      };

      const response = await request(app).post('/auth/login').send(credentials).set('Accept', 'application/json');
      const result: ServiceResponse = response.body;

      console.log(result);
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.responseObject).toEqual(userResponse);
      expect(result.message).toEqual('Successfully logged in');
    });
  });
});

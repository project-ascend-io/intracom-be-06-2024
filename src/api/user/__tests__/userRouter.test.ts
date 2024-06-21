import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, describe, expect, it, Mock, vi } from 'vitest';

import { User } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
// import { UserModel as User } from '@/api/user/userModel';
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

describe('User API Endpoints', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });
  // Mock Users

  describe('GET /users', () => {
    it('should return a list of users', async () => {
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
      const responseMock = new ServiceResponse<User[]>(ResponseStatus.Success, 'Users found', userList, StatusCodes.OK);

      (userService.findAll as Mock).mockReturnValue(responseMock);
      // Act
      const response = await request(app).get('/users');
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Users found');
      // expect(responseBody.responseObject.length).toEqual(users.length);
      // responseBody.responseObject.forEach((user, index) => compareUsers(users[index] as User, user));
    });
  });

  // describe('GET /users/:id', () => {
  //   it('should return a user for a valid ID', async () => {
  //     // Arrange
  //     const testId = 1;
  //     const expectedUser = users.find((user) => user.id === testId) as User;
  //
  //     // Act
  //     const response = await request(app).get(`/users/${testId}`);
  //     const responseBody: ServiceResponse<User> = response.body;
  //
  //     // Assert
  //     expect(response.statusCode).toEqual(StatusCodes.OK);
  //     expect(responseBody.success).toBeTruthy();
  //     expect(responseBody.message).toContain('User found');
  //     if (!expectedUser) throw new Error('Invalid test data: expectedUser is undefined');
  //     compareUsers(expectedUser, responseBody.responseObject);
  //   });
  //
  //   it('should return a not found error for non-existent ID', async () => {
  //     // Arrange
  //     const objectId = new mongoose.mongo.ObjectId();
  //
  //     // Act
  //     const response = await request(app).get(`/users/${objectId.toString()}`);
  //     const responseBody: ServiceResponse = response.body;
  //
  //     // Assert
  //     expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
  //     expect(responseBody.success).toBeFalsy();
  //     expect(responseBody.message).toContain('User not found');
  //     expect(responseBody.responseObject).toBeNull();
  //   });
  //
  //   it('should return a bad request for invalid ID format', async () => {
  //     // Act
  //     const invalidInput = 1;
  //     const response = await request(app).get(`/users/${invalidInput}`);
  //     const responseBody: ServiceResponse = response.body;
  //
  //     // Assert
  //     expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
  //     expect(responseBody.success).toBeFalsy();
  //     expect(responseBody.message).toContain('Invalid input');
  //     expect(responseBody.responseObject).toBeNull();
  //   });
  // });
});

// function compareUsers(mockUser: User, responseUser: User) {
//   if (!mockUser || !responseUser) {
//     throw new Error('Invalid test data: mockUser or responseUser is undefined');
//   }
//
//   expect(responseUser.id).toEqual(mockUser.id);
//   expect(responseUser.name).toEqual(mockUser.name);
//   expect(responseUser.email).toEqual(mockUser.email);
//   expect(responseUser.age).toEqual(mockUser.age);
//   expect(new Date(responseUser.createdAt)).toEqual(mockUser.createdAt);
//   expect(new Date(responseUser.updatedAt)).toEqual(mockUser.updatedAt);
// }

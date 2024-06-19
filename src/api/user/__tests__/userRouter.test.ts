import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { User } from '@/api/user/userModel';
import { users } from '@/api/user/userRepository';
// Added import
import { userService } from '@/api/user/userService';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('@/api/user/userService');

describe('User API Endpoints', () => {
  describe('GET /users', () => {
    it('should return a list of users', async () => {
      // Act
      const response = await request(app).get('/users');
      const responseBody: ServiceResponse<User[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Users found');
      expect(responseBody.responseObject.length).toEqual(users.length);
      responseBody.responseObject.forEach((user, index) => compareUsers(users[index] as User, user));
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const expectedUser = users.find((user) => user.id === testId) as User;

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
      const testId = Number.MAX_SAFE_INTEGER;

      // Act
      const response = await request(app).get(`/users/${testId}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('User not found');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for invalid ID format', async () => {
      // Act
      const invalidInput = 'abc';
      const response = await request(app).get(`/users/${invalidInput}`);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid input');
      expect(responseBody.responseObject).toBeNull();
    });
  });

  describe('POST /users/signup', () => {
    it('should sign up a new user', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: 30,
      };
      (userService.signup as Mock).mockResolvedValue({ status: 'success', data: 'token' });

      const response = await request(app).post('/users/signup').send(requestBody);

      expect(response.status).toBe(200);
      expect(response.body.data).toBe('token');
    });

    it('should handle passwords do not match', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password456',
        age: 30,
      };
      (userService.signup as Mock).mockResolvedValue({ status: 'failed', message: 'Passwords do not match' });

      const response = await request(app).post('/users/signup').send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Passwords do not match');
    });

    it('should handle user already exists', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: 30,
      };
      (userService.signup as Mock).mockResolvedValue({ status: 'failed', message: 'User already exists' });

      const response = await request(app).post('/users/signup').send(requestBody);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('User already exists');
    });

    it('should handle errors', async () => {
      const requestBody = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        age: 30,
      };
      (userService.signup as Mock).mockResolvedValue({
        status: 'failed',
        message: 'userService - Signup - Error Message',
      });

      const response = await request(app).post('/users/signup').send(requestBody);

      expect(response.status).toBe(500);
      expect(response.body.message).toContain('userService - Signup - Error Message');
    });
  });
});

function compareUsers(mockUser: User, responseUser: User) {
  if (!mockUser || !responseUser) {
    throw new Error('Invalid test data: mockUser or responseUser is undefined');
  }

  expect(responseUser.id).toEqual(mockUser.id);
  expect(responseUser.name).toEqual(mockUser.name);
  expect(responseUser.email).toEqual(mockUser.email);
  expect(responseUser.age).toEqual(mockUser.age);
  expect(new Date(responseUser.createdAt)).toEqual(mockUser.createdAt);
  expect(new Date(responseUser.updatedAt)).toEqual(mockUser.updatedAt);
}

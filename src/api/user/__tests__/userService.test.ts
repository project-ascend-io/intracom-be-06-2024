import bcrypt from 'bcryptjs';
// Added imports
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { describe, expect, it, Mock, vi } from 'vitest';

import { User } from '@/api/user/userModel';
import { userRepository } from '@/api/user/userRepository';
import { userService } from '@/api/user/userService';

vi.mock('@/api/user/userRepository');
// Added mocks
vi.mock('bcryptjs');
vi.mock('jsonwebtoken');

vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('userService', () => {
  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Alice',
      email: 'alice@example.com',
      password: 'alicespassword',
      age: 42,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      name: 'Bob',
      email: 'bob@example.com',
      password: 'bobspassword',
      age: 21,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  describe('findAll', () => {
    it('return all users', async () => {
      // Arrange
      (userRepository.findAllAsync as Mock).mockReturnValue(mockUsers);

      // Act
      const result = await userService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Users found');
      expect(result.responseObject).toEqual(mockUsers);
    });

    it('returns a not found error for no users found', async () => {
      // Arrange
      (userRepository.findAllAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Users found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findAllAsync', async () => {
      // Arrange
      (userRepository.findAllAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Error finding all users');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('findById', () => {
    it('returns a user for a valid ID', async () => {
      // Arrange
      const testId = 1;
      const mockUser = mockUsers.find((user) => user.id === testId);
      (userRepository.findByIdAsync as Mock).mockReturnValue(mockUser);

      // Act
      const result = await userService.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User found');
      expect(result.responseObject).toEqual(mockUser);
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      const testId = 1;
      (userRepository.findByIdAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userService.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain(`Error finding user with id ${testId}`);
      expect(result.responseObject).toBeNull();
    });

    it('returns a not found error for non-existent ID', async () => {
      // Arrange
      const testId = 1;
      (userRepository.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userService.findById(testId);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User not found');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('insertUser', () => {
    it('should insert a new user', async () => {
      const request = {
        body: { name: 'John Doe', email: 'john@example.com', password: 'password123', age: 30 },
      } as Request;

      (userRepository.findByEmailAsync as Mock).mockResolvedValue(null);

      (userRepository.insertUser as Mock).mockResolvedValue({ ...request.body, id: 1 });

      const response = await userService.insertUser(request);
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(response.responseObject).toHaveProperty('id');
    });

    it('should handle user already exists', async () => {
      const request = {
        body: { name: 'John Doe', email: 'john@example.com', password: 'password123', age: 30 },
      } as Request;

      (userRepository.findByEmailAsync as Mock).mockResolvedValue(request.body);

      const response = await userService.insertUser(request);
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(response.message).toBe('User already exists');
    });

    it('should handle errors', async () => {
      const request = {
        body: { name: 'John Doe', email: 'john@example.com', password: 'password123', age: 30 },
      } as Request;

      (userRepository.findByEmailAsync as Mock).mockRejectedValue(new Error('Database error'));

      const response = await userService.insertUser(request);
      expect(response.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(response.message).toContain('userService - InsertUser - Error Message');
    });
  });

  describe('signup', () => {
    it('allows a new user to create an account', async () => {
      // Arrange
      const testRequest = {
        id: 3,
        name: 'Cigana',
        email: 'cigana@example.com',
        password: 'ciganaspassword',
        // confirmPassword: 'ciganaspassword',
        age: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Request;

      (userRepository.findByEmailAsync as Mock).mockResolvedValue(null);
      (userRepository.insertUser as Mock).mockResolvedValue({ ...testRequest.body, id: 1 });
      (bcrypt.hash as Mock).mockResolvedValue('hashedPassword');
      (jwt.sign as Mock).mockReturnValue('token');
      // Act
      const result = await userService.signup(testRequest);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User created');
      expect(result.responseObject).toBe('token');
    });

    it('handles errors for findByEmailAsync', async () => {
      // Arrange
      const testRequest = {
        id: 3,
        name: 'Cigana',
        email: 'cigana@example.com',
        password: 'ciganaspassword',
        // confirmPassword: 'ciganaspassword',
        age: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Request;

      (userRepository.findByEmailAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userService.signup(testRequest);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain(`userService - Signup - Error Message: ${err.message}`);
      expect(result.responseObject).toBeNull();
    });

    it('returns a bad request error for non-matching passwords', async () => {
      // Arrange
      const testRequest = {
        id: 3,
        name: 'Cigana',
        email: 'cigana@example.com',
        password: 'ciganaspassword',
        // confirmPassword: 'ciganaspassword',
        age: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Request;

      (userRepository.findByEmailAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userService.signup(testRequest);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Passwords do not match');
      expect(result.responseObject).toBeNull();
    });

    it('returns a bad request error for existing users', async () => {
      // Arrange
      const testRequest = {
        id: 3,
        name: 'Cigana',
        email: 'cigana@example.com',
        password: 'ciganaspassword',
        // confirmPassword: 'ciganaspassword',
        age: 35,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Request;

      (userRepository.findByEmailAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userService.signup(testRequest);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User already exists');
      expect(result.responseObject).toBeNull();
    });
  });
});

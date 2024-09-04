import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { describe, expect, it, Mock, vi } from 'vitest';

import { userRepository } from '@/api/user/userRepository';
import { User, UserResponse } from '@/api/user/userSchema';
import { userService } from '@/api/user/userService';
import { PostUser } from '@/api/user/userValidation';
import { userInviteRepository } from '@/api/userInvite/userInviteRepository';
import { UserInvite } from '@/api/userInvite/userInviteSchema';

import { userRoles } from '../userModel';

vi.mock('@/api/user/userRepository');
vi.mock('@/api/userInvite/userInviteRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('userService', () => {
  const mockUsers: User[] = [
    {
      _id: new mongoose.mongo.ObjectId(),
      username: 'Alice',
      email: 'alice@example.com',
      organization: new mongoose.mongo.ObjectId(),
      password: 'Testing123!',
      role: userRoles.Admin,
    },
    {
      _id: new mongoose.mongo.ObjectId(),
      username: 'Bob',
      email: 'bob@example.com',
      organization: new mongoose.mongo.ObjectId(),
      password: 'Testing123!',
      role: userRoles.Admin,
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
      const testId = mockUsers['1']._id;
      const mockUser = mockUsers.find((user) => user._id === testId);
      (userRepository.findByIdAsync as Mock).mockReturnValue(mockUser);

      // Act
      const result = await userService.findById(testId.toString());

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User found');
      expect(result.responseObject).toEqual(mockUser);
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      const testId = mockUsers['1']._id;
      (userRepository.findByIdAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userService.findById(testId.toString());

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain(`Error finding user with id ${testId}`);
      expect(result.responseObject).toBeNull();
    });

    it('returns a not found error for non-existent ID', async () => {
      // Arrange
      const testId = mockUsers['1']._id;
      (userRepository.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userService.findById(testId.toString());

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User not found');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('insertUser', () => {
    it('returns user created', async () => {
      const newUser: PostUser = {
        hash: '7e8d13cb237f5a3d323eb5d06bcb2e5df497026ef286219075b2ef14214c1917',
        username: 'username',
        password: 'Testing123!',
      };

      const date = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

      const userInvite: UserInvite = {
        _id: new mongoose.mongo.ObjectId(),
        email: 'test@gmail.com',
        state: 'Pending',
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'ABC Company',
        },
        expires_in: date,
        hash: '7e8d13cb237f5a3d323eb5d06bcb2e5df497026ef286219075b2ef14214c1917',
      };

      const savedUser = {
        _id: new mongoose.mongo.ObjectId(),
        username: newUser.username,
        email: userInvite.email,
        password: newUser.password,
        organization: {
          _id: userInvite.organization._id,
          name: userInvite.organization.name,
        },
        role: userRoles.User,
      };

      const userResponse: UserResponse = {
        _id: savedUser._id,
        username: savedUser.username,
        email: savedUser.email,
        organization: {
          _id: savedUser.organization._id,
          name: savedUser.organization.name,
        },
        role: savedUser.role,
      };

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(userInvite);
      (userRepository.findByEmailAsync as Mock).mockReturnValue(null);
      (userRepository.insertUser as Mock).mockReturnValue(savedUser);

      // Act
      const result = await userService.insertUser(newUser, userRoles.User);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.CREATED);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User created');
      expect(result.responseObject).toEqual(userResponse);
    });
    it('returns User invite not found', async () => {
      const newUser: PostUser = {
        hash: '123',
        username: 'username',
        password: 'Testing123!',
      };

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userService.insertUser(newUser, userRoles.User);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User invite not found');
      expect(result.responseObject).toEqual(null);
    });
    it('returns User invite expired', async () => {
      const newUser: PostUser = {
        hash: '7e8d13cb237f5a3d323eb5d06bcb2e5df497026ef286219075b2ef14214c1917',
        username: 'username',
        password: 'Testing123!',
      };

      const userInvite: UserInvite = {
        _id: new mongoose.mongo.ObjectId(),
        email: 'test@gmail.com',
        state: 'Pending',
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'ABC Company',
        },
        expires_in: '2024-08-09T01:16:20.091Z',
        hash: '7e8d13cb237f5a3d323eb5d06bcb2e5df497026ef286219075b2ef14214c1917',
      };

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(userInvite);

      // Act
      const result = await userService.insertUser(newUser, userRoles.User);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User invite expired');
      expect(result.responseObject).toEqual(null);
    });
    it('returns User already exists', async () => {
      const newUser: PostUser = {
        hash: '7e8d13cb237f5a3d323eb5d06bcb2e5df497026ef286219075b2ef14214c1917',
        username: 'username',
        password: 'Testing123!',
      };

      const date = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();

      const userInvite: UserInvite = {
        _id: new mongoose.mongo.ObjectId(),
        email: 'test@gmail.com',
        state: 'Pending',
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'ABC Company',
        },
        expires_in: date,
        hash: '7e8d13cb237f5a3d323eb5d06bcb2e5df497026ef286219075b2ef14214c1917',
      };

      const foundUser = {
        _id: new mongoose.mongo.ObjectId(),
        username: newUser.username,
        email: userInvite.email,
        password: newUser.password,
        organization: {
          _id: userInvite.organization._id,
          name: userInvite.organization.name,
        },
        role: userRoles.User,
      };

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(userInvite);
      (userRepository.findByEmailAsync as Mock).mockReturnValue(foundUser);

      // Act
      const result = await userService.insertUser(newUser, userRoles.User);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.UNAUTHORIZED);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User already exists');
      expect(result.responseObject).toEqual(null);
    });
  });
});

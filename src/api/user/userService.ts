import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { organizationRepository } from '@/api/organization/organizationRepository';
import { userRepository } from '@/api/user/userRepository';
import { BasicUser, User, UserResponse } from '@/api/user/userSchema';
import { PostUser } from '@/api/user/userValidation';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { env } from '@/common/utils/envConfig';
import { logger } from '@/server';

import { userRoles } from './userModel';

export const userService = {
  // Retrieves all users from the database
  findAll: async (): Promise<ServiceResponse<User[] | null>> => {
    try {
      const users = await userRepository.findAllAsync();
      if (!users) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Users found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<User[]>(ResponseStatus.Success, 'Users found', users, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: string): Promise<ServiceResponse<UserResponse | null>> => {
    try {
      const user = await userRepository.findByIdAsync(id);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserResponse>(ResponseStatus.Success, 'User found', user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  insertUser: async (
    user: PostUser,
    role: userRoles = userRoles.Admin
  ): Promise<ServiceResponse<UserResponse | null>> => {
    try {
      const existingUser = await userRepository.findByEmailAsync(user.email);

      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      const savedUser = await organizationRepository
        .insert({
          name: user.organization,
        })
        .then(async (org) => {
          return await userRepository.insertUser({
            username: user.username,
            email: user.email,
            password: user.password,
            organization: org._id,
            role,
          });
        })
        .catch((err) => {
          throw new Error(err.message);
        });

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

      return new ServiceResponse<UserResponse>(
        ResponseStatus.Success,
        'User created.',
        userResponse,
        StatusCodes.CREATED
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `Error creating new user: , ${(err as Error).message}`;
      //const errorMessage = `[Error] userService - InsertUser: `;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  signup: async (request: Request): Promise<ServiceResponse<string | null>> => {
    try {
      const { email, username, password, organization, role } = request.body;

      const existingUser = await userRepository.findByEmailAsync(email);
      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: BasicUser = {
        email,
        username,
        organization,
        password: hashedPassword,
        role,
      };

      const savedUser = await userRepository.insertUser(newUser);

      const payload = { id: savedUser._id };
      const { JWT_SECRET } = env;
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

      return new ServiceResponse<string>(ResponseStatus.Success, 'User created.', token, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `userService - Signup - Error Message: ${err}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

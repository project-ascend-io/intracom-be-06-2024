import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';

import { userRepository } from '@/api/user/userRepository';
import { INewUserSchema, NewUserSchema, User } from '@/api/user/userSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { env } from '@/common/utils/envConfig';
import { logger } from '@/server';

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

  findById: async (id: string): Promise<ServiceResponse<User | null>> => {
    try {
      const user = await userRepository.findByIdAsync(id);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<User>(ResponseStatus.Success, 'User found', user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  insertUser: async (request: Request): Promise<ServiceResponse<User | null>> => {
    try {
      console.log('Body: ', request.body);
      const user = NewUserSchema.parse({ ...request.body });
      console.log('New User Schema', user);

      const existingUser = await userRepository.findByEmailAsync(user.email);

      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      const newUser = await userRepository.insertUser({
        ...user,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return new ServiceResponse<User>(ResponseStatus.Success, 'User created.', newUser, StatusCodes.OK);
    } catch (err) {
      console.log(err);
      const errorMessage = `[Error] userService - InsertUser: `;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  signup: async (request: Request): Promise<ServiceResponse<string | null>> => {
    try {
      const { email, username, password } = request.body;

      const existingUser = await userRepository.findByEmailAsync(email);
      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser: INewUserSchema = {
        email,
        username,
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const savedUser = await userRepository.insertUser(newUser);

      const payload = { id: savedUser.id };
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

// eslint-disable-next-line simple-import-sort/imports
import { NewUserSchema, User } from '@/api/user/userModel';
import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { NewUser } from './__tests__/userService.test';

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

  // Retrieves a single user by their ID
  findById: async (id: number): Promise<ServiceResponse<User | null>> => {
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
      console.log('Params: ', request.params);
      const user = NewUserSchema.parse({ ...request.body });
      console.log('New User Schema', user);

      // This initializes a variable to represent an existing user found in the repository by their email address
      const existingUser = await userRepository.findByEmailAsync(user.email);

      // This checks to see if the email address entered by the user already exists in the system, in which case it will throw an error
      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      const newUser = await userRepository.insertUser(user);

      return new ServiceResponse<User>(ResponseStatus.Success, 'User created.', newUser, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `userService - InsertUser - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // This checks if the password entered initially matches the one entered when prompted to 'Confirm Password' and throws an error if validation fails. Then it checks to see if the email address entered by the user already exists already exists in the system, in which case it will throw an error and not allow the user to signup. If it passes both checks, it will create a new user and save it to the repository.
  signup: async (user: NewUser): Promise<ServiceResponse<User | null>> => {
    try {
      if (user.password !== user.confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const existingUser = await userRepository.findByEmailAsync(user.email);
      if (existingUser) {
        throw new Error('User already exists.');
      }

      const savedUser = await userRepository.insertUser(user);

      return new ServiceResponse<User>(ResponseStatus.Success, 'User created.', savedUser, StatusCodes.OK);
    } catch (err) {
      const errorMessage = `userService - Signup - Error Message: ${err.message}`;
      logger.error(errorMessage);

      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

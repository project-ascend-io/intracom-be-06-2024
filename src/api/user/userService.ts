// eslint-disable-next-line simple-import-sort/imports
import bcrypt from 'bcryptjs';
import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { NewUserSchema, User } from '@/api/user/userModel';
import { userRepository } from '@/api/user/userRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

// import { config } from '@/config';

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
  signup: async (request: Request): Promise<ServiceResponse<string | null>> => {
    try {
      const { email, password /* , confirmPassword */ } = request.body;

      if (request.body.password !== request.body.confirmPassword) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          success: false,
          message: 'Passwords do not match',
          responseObject: null,
        };
      }

      const existingUser = await userRepository.findByEmailAsync(email);
      if (existingUser) {
        return {
          statusCode: StatusCodes.BAD_REQUEST,
          success: false,
          message: 'User already exists',
          responseObject: null,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = new User(request.body.name, email, hashedPassword, request.body.age);

      // const newUser = new User(request.body.name, email, hashedPassword, confirmPassword);

      await userRepository.insertUser(newUser);

      const payload = { id: newUser.id };
      const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

      return {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'User created',
        responseObject: token,
      };
    } catch (err) {
      const errorMessage = `userService - Signup - Error Message: ${err.message}`;
      logger.error(errorMessage);

      return {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: 'Error signing up new user',
        responseObject: null,
      };
    }
  },
};

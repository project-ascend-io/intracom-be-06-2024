import { StatusCodes } from 'http-status-codes';

import { organizationRepository } from '@/api/organization/organizationRepository';
import { userRepository } from '@/api/user/userRepository';
import { User, UserResponse } from '@/api/user/userSchema';
import { PostAdminUser, PostUser } from '@/api/user/userValidation';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import logger from '@/common/utils/logConfig';

import { userInviteRepository } from '../userInvite/userInviteRepository';
import { isValid } from '../userInvite/userInviteService';
import { userRoles } from './userModel';

export const userService = {
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

  insertUser: async (user: PostUser, role: userRoles): Promise<ServiceResponse<UserResponse | null>> => {
    try {
      const userInvite = await userInviteRepository.findByHashAsync(user.hash);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User invite not found', null, StatusCodes.UNAUTHORIZED);
      }
      if (!isValid(userInvite.expires_in)) {
        return new ServiceResponse(ResponseStatus.Failed, 'User invite expired', null, StatusCodes.UNAUTHORIZED);
      }

      const existingUser = await userRepository.findByEmailAsync(userInvite.email);
      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, `User already exists`, null, StatusCodes.UNAUTHORIZED);
      }

      const savedUser = await userRepository
        .insertUser({
          username: user.username,
          email: userInvite.email,
          password: user.password,
          organization: userInvite.organization._id,
          role,
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

      /// removing exp date and hash for User Invite for security reasons after User has created an account
      const userInviteParams: any = {
        expires_in: '',
        hash: '',
      };
      await userInviteRepository.update(userInvite._id.toString(), userInviteParams);

      return new ServiceResponse<UserResponse>(
        ResponseStatus.Success,
        'User created.',
        userResponse,
        StatusCodes.CREATED
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `Error creating new user: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  insertUserAndOrganization: async (
    user: PostAdminUser,
    role: userRoles
  ): Promise<ServiceResponse<UserResponse | null>> => {
    try {
      const existingUser = await userRepository.findByEmailAsync(user.email);

      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User already exists', null, StatusCodes.BAD_REQUEST);
      }

      const savedUser = await organizationRepository
        .insert({
          name: user.organization,
          instanceUrl: user.instanceUrl,
        })
        .then(async (org) => {
          return await userRepository.insertUserAndOrganization({
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
        'User and Organization created.',
        userResponse,
        StatusCodes.CREATED
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `Error creating new user and organization: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { userInviteRepository } from './userInviteRepository';
import { UserInvite } from './userInviteSchema';
import { PostUserInvite } from './userInviteValidation';

export const userInviteService = {
  get: async (): Promise<ServiceResponse<UserInvite[] | null>> => {
    try {
      const userInvites: UserInvite[] = await userInviteRepository.findAllAsync();
      if (!userInvites) {
        return new ServiceResponse(ResponseStatus.Failed, 'No User Invites found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserInvite[]>(
        ResponseStatus.Success,
        'User Invites found',
        userInvites,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding all users: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  findById: async (id: string): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const userInvite = await userInviteRepository.findByIdAsync(id);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserInvite>(ResponseStatus.Success, 'User Invite found', userInvite, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with id ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  insert: async (user: PostUserInvite): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const existingUser = await userInviteRepository.findByEmailAsync(user.email);

      if (existingUser) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite already exists', null, StatusCodes.BAD_REQUEST);
      }

      const savedUserInvite = await userInviteRepository.insert(user);

      return new ServiceResponse<UserInvite>(
        ResponseStatus.Success,
        'User invite created.',
        savedUserInvite,
        StatusCodes.OK
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `[Error] insert service: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

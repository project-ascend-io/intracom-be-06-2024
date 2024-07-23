import crypto from 'crypto';
import { randomBytes } from 'crypto';
import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { inviteState } from './userInviteModel';
import { userInviteRepository } from './userInviteRepository';
import { UserInvite } from './userInviteSchema';
import { PostUserInvite } from './userInviteValidation';

const generateHash = (inputString: string) => {
  const hash = crypto.createHash('sha256');
  hash.update(inputString);
  return hash.digest('hex');
};

const generateExpDate = () => {
  const currentDate = new Date();
  const daysToAdd = 7;
  const expDate = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return expDate.toISOString();
};

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

  findByEmail: async (email: string): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const userInvite = await userInviteRepository.findByEmailAsync(email);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserInvite>(ResponseStatus.Success, 'User Invite found', userInvite, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user with email ${email}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  insert: async (userInvite: PostUserInvite): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const existingUserInvite = await userInviteRepository.findByEmailAsync(userInvite.email);

      if (existingUserInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite already exists', null, StatusCodes.BAD_REQUEST);
      }

      const savedUserInvite = await userInviteRepository.insert({
        email: userInvite.email,
        state: inviteState.Pending,
        organization: userInvite.organization,
        hash: generateHash(userInvite.email),
        expires_in: generateExpDate(),
      });

      return new ServiceResponse<UserInvite>(
        ResponseStatus.Success,
        'User invite created.',
        savedUserInvite,
        StatusCodes.CREATED
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `[Error] insert service: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  update: async (id: string, userInviteParams: any): Promise<ServiceResponse<UserInvite | null>> => {
    const isValid = (expirationDate: string) => {
      return new Date(expirationDate) > new Date();
    };

    try {
      const userInvite = await userInviteRepository.findByIdAsync(id);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.BAD_REQUEST);
      }
      if ('state' in userInviteParams) {
        if (userInviteParams.state == inviteState.Accepted && !isValid(userInvite.expires_in)) {
          userInviteParams.state = inviteState.Expired;
          return new ServiceResponse(ResponseStatus.Failed, 'User Invite expired', null, StatusCodes.BAD_REQUEST);
        } else if (userInviteParams.state == inviteState.Denied) {
          userInviteParams.hash = '';
          userInviteParams.expires_in = '';
        } else if (userInviteParams.state == inviteState.Pending) {
          const newStr = randomBytes(10).toString('hex');
          userInviteParams.hash = generateHash(userInviteParams.email + newStr);
          userInviteParams.expires_in = generateExpDate();
        }
      }

      const savedUserInvite = await userInviteRepository.update(id, userInviteParams);

      return new ServiceResponse<UserInvite | null>(
        ResponseStatus.Success,
        'User invite updated.',
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

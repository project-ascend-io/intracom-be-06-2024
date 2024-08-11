import crypto from 'crypto';
import { randomBytes } from 'crypto';
import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { organizationRepository } from '../organization/organizationRepository';
import { inviteState } from './userInviteModel';
import { userInviteRepository } from './userInviteRepository';
import { UserInvite } from './userInviteSchema';

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
export const isValid = (expirationDate: string) => {
  return new Date(expirationDate) > new Date();
};

const setStateParams = (userInviteParams: any, userInvite: UserInvite) => {
  if (userInviteParams.state == inviteState.Accepted && !isValid(userInvite.expires_in)) {
    userInviteParams.state = inviteState.Expired;
  } else if (userInviteParams.state == inviteState.Denied) {
    userInviteParams.hash = '';
    userInviteParams.expires_in = '';
  } else if (userInviteParams.state == inviteState.Pending) {
    const newStr = randomBytes(10).toString('hex');
    userInviteParams.hash = generateHash(userInviteParams.email + newStr);
    userInviteParams.expires_in = generateExpDate();
  }
  return userInviteParams;
};

export const userInviteService = {
  getInvitesByOrgId: async (id: string, queryParams: any): Promise<ServiceResponse<UserInvite[] | null>> => {
    try {
      const userInvites = await userInviteRepository.findUserInvitesByOrdId(id, queryParams);
      if (userInvites.length == 0) {
        return new ServiceResponse(ResponseStatus.Success, 'User Invites not found', null, StatusCodes.OK);
      }
      return new ServiceResponse<UserInvite[]>(
        ResponseStatus.Success,
        'User Invites Found',
        userInvites,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding all user invites: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  getByhash: async (hash: string): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const userInvite = await userInviteRepository.findByHashAsync(hash);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.NOT_FOUND);
      }

      if (!isValid(userInvite.expires_in)) {
        return new ServiceResponse(ResponseStatus.Failed, 'User invitation has expired', null, StatusCodes.GONE);
      }
      const orgId = userInvite.organization._id;
      const organization = await organizationRepository.findByIdAsync(orgId);
      const userInviteResponse = {
        _id: userInvite._id,
        email: userInvite.email,
        state: userInvite.state,
        organization: {
          _id: organization?._id,
          name: organization?.name,
        },
        expires_in: userInvite.expires_in,
        hash: userInvite.hash,
      };

      return new ServiceResponse<any | null>(
        ResponseStatus.Success,
        'User invite found.',
        userInviteResponse,
        StatusCodes.OK
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `[Error] insert service: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  insertInvites: async (
    organizationId: string,
    userEmails: string[]
  ): Promise<ServiceResponse<UserInvite[] | null>> => {
    const createdInvites: UserInvite[] = [];
    try {
      const organization = await organizationRepository.findByIdAsync(organizationId);
      if (!organization) {
        return new ServiceResponse(ResponseStatus.Failed, 'Organization not found', null, StatusCodes.NOT_FOUND);
      }
      for (const email of userEmails) {
        const existingUserInvite = await userInviteRepository.findByEmailAsync(email);
        if (existingUserInvite) {
          return new ServiceResponse(
            ResponseStatus.Failed,
            'User Invite already exists',
            null,
            StatusCodes.UNPROCESSABLE_ENTITY
          );
        }
      }
      for (const email of userEmails) {
        const newUserInvite: UserInvite = {
          email: email,
          state: inviteState.Pending,
          organization: organizationId,
          hash: generateHash(email),
          expires_in: generateExpDate(),
        };
        const savedUserInvite = await userInviteRepository.insert(newUserInvite);
        createdInvites.push(savedUserInvite);
      }

      return new ServiceResponse<UserInvite[]>(
        ResponseStatus.Success,
        'User invites created.',
        createdInvites,
        StatusCodes.CREATED
      );
    } catch (err) {
      console.log(err);
      const errorMessage = `[Error] insert service: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  updateById: async (id: string, orgId: string, userInviteParams: any): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const organization = await organizationRepository.findByIdAsync(orgId);
      if (!organization) {
        return new ServiceResponse(ResponseStatus.Failed, 'Organization not found', null, StatusCodes.NOT_FOUND);
      }

      const userInvite = await userInviteRepository.findByIdAsync(id);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.NOT_FOUND);
      }
      if ('state' in userInviteParams) {
        userInviteParams = setStateParams(userInviteParams, userInvite);
      }
      const savedUserInvite = await userInviteRepository.update(id, userInviteParams);

      if ('state' in userInviteParams && userInviteParams.state == inviteState.Expired) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite expired', null, StatusCodes.BAD_REQUEST);
      }

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

  updateByHash: async (hash: string, userInviteParams: any): Promise<ServiceResponse<UserInvite | null>> => {
    try {
      const userInvite = await userInviteRepository.findByHashAsync(hash);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.NOT_FOUND);
      }
      if ('state' in userInviteParams) {
        userInviteParams = setStateParams(userInviteParams, userInvite);
      }
      const savedUserInvite = await userInviteRepository.update(userInvite._id, userInviteParams);

      if ('state' in userInviteParams && userInviteParams.state == inviteState.Expired) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite expired', null, StatusCodes.BAD_REQUEST);
      }

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

  deleteById: async (id: string, orgId: string): Promise<ServiceResponse<null>> => {
    try {
      const organization = await organizationRepository.findByIdAsync(orgId);
      if (!organization) {
        return new ServiceResponse(ResponseStatus.Failed, 'Organization not found', null, StatusCodes.NOT_FOUND);
      }
      const userInvite = await userInviteRepository.findByIdAsync(id);
      if (!userInvite) {
        return new ServiceResponse(ResponseStatus.Failed, 'User Invite not found', null, StatusCodes.NOT_FOUND);
      }

      await userInviteRepository.deleteById(id);

      return new ServiceResponse<null>(ResponseStatus.Success, '', null, StatusCodes.NO_CONTENT);
    } catch (err) {
      console.log(err);
      const errorMessage = `[Error] delete service: , ${(err as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

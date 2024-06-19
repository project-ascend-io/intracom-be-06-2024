import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import { DeleteResult } from 'mongodb';

import { NewUserProfileSchema, UserProfile } from '@/api/userProfile/userProfileModel';
import { userProfileRepository } from '@/api/userProfile/userProfileRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

export const userProfileService = {
  // Retrieves all user profiles from the database
  findAll: async (): Promise<ServiceResponse<UserProfile[] | null>> => {
    try {
      const users = await userProfileRepository.findAllAsync();
      if (!users) {
        return new ServiceResponse(ResponseStatus.Failed, 'No User Profiles found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserProfile[]>(ResponseStatus.Success, 'User Profiles found', users, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding all user profiles: $${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Retrieves a single user profile by their users ID
  findById: async (id: number): Promise<ServiceResponse<UserProfile | null>> => {
    try {
      const user = await userProfileRepository.findByIdAsync(id);
      if (!user) {
        return new ServiceResponse(ResponseStatus.Failed, 'User profile not found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<UserProfile>(ResponseStatus.Success, 'User profile found', user, StatusCodes.OK);
    } catch (ex) {
      const errorMessage = `Error finding user profile with userId ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Inserts a new user profile into the database
  insertUserProfile: async (request: Request): Promise<ServiceResponse<UserProfile | null>> => {
    try {
      const userProfile = NewUserProfileSchema.parse({ ...request.body });

      const newUserProfile = await userProfileRepository.insertUserProfile(userProfile);

      return new ServiceResponse<UserProfile>(
        ResponseStatus.Success,
        'User profile created.',
        newUserProfile,
        StatusCodes.OK
      );
    } catch (err) {
      const errorMessage = `userProfileService - InsertUserProfile - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Retrieves a single user profile by their users ID
  deleteByUserId: async (id: number): Promise<ServiceResponse<DeleteResult | null>> => {
    try {
      const user = await userProfileRepository.deleteByUserIdAsync(id);
      return new ServiceResponse<DeleteResult | null>(
        ResponseStatus.Success,
        'User profile deleted',
        user,
        StatusCodes.OK
      );
    } catch (ex) {
      const errorMessage = `Error finding user profile with userId ${id}:, ${(ex as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Changes data on a user profile into the database
  patchUserProfile: async (request: Request): Promise<ServiceResponse<null>> => {
    try {
      const userProfile = NewUserProfileSchema.parse({ ...request.body });

      const updateResult = await userProfileRepository.patchUserProfile(userProfile);

      if (updateResult && updateResult.modifiedCount > 0) {
        return new ServiceResponse<null>(
          ResponseStatus.Success,
          'User profile updated successfully.',
          null,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse<null>(
          ResponseStatus.Failed,
          'No user profile was updated.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
    } catch (err) {
      const errorMessage = `userProfileService - PatchUserProfile - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

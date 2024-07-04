import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { NewEmailSettingsSchema } from '@/api/emailSettings/emailSettingsModel';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { EmailSettings } from './emailSettingsModel';
import { emailSettingsRepository } from './emailSettingsRepository';

export const emailSettingsService = {
  // Retrieves all email settings from the database
  findAll: async (): Promise<ServiceResponse<EmailSettings[] | null>> => {
    try {
      const emailSettings = await emailSettingsRepository.findAllAsync();
      if (!emailSettings) {
        return new ServiceResponse(ResponseStatus.Failed, 'No Email Settings found', null, StatusCodes.NOT_FOUND);
      }
      return new ServiceResponse<EmailSettings[]>(
        ResponseStatus.Success,
        'Email Settings found',
        emailSettings,
        StatusCodes.OK
      );
    } catch (error) {
      const errorMessage = `Error finding all email-settings: $${(error as Error).message}`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Inserts a new email settings into the database
  insertEmailSettings: async (request: Request): Promise<ServiceResponse<EmailSettings | null>> => {
    try {
      const emailSettings = NewEmailSettingsSchema.parse({ ...request.body });

      const newEmailSettings = await emailSettingsRepository.insertEmailSettings(emailSettings);

      return new ServiceResponse<EmailSettings>(
        ResponseStatus.Success,
        'Email Settings created.',
        newEmailSettings,
        StatusCodes.OK
      );
    } catch (err) {
      const errorMessage = `userProfileService - InsertUserProfile - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Changes data on an email settings in the database
  putEmailSettings: async (request: Request): Promise<ServiceResponse<null>> => {
    try {
      const emailSettings = NewEmailSettingsSchema.parse({ ...request.body });

      const updateResult = await emailSettingsRepository.updateEmailSettings(emailSettings);

      if (updateResult && updateResult.modifiedCount > 0) {
        return new ServiceResponse<null>(
          ResponseStatus.Success,
          'Email Settings updated successfully.',
          null,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse<null>(
          ResponseStatus.Failed,
          'No email settings was updated.',
          null,
          StatusCodes.NOT_FOUND
        );
      }
    } catch (error) {
      const errorMessage = `emailSettingsService - PatchEmailSettings - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  // Tests the email settings
  testEmailSettings: async (request: Request): Promise<ServiceResponse<null>> => {
    try {
      const testResult = await emailSettingsRepository.testEmailSettings(request.body);

      if (testResult) {
        return new ServiceResponse<null>(
          ResponseStatus.Success,
          'Email Settings tested successfully.',
          null,
          StatusCodes.OK
        );
      } else {
        return new ServiceResponse<null>(
          ResponseStatus.Failed,
          'Email Settings test failed.',
          null,
          StatusCodes.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      const errorMessage = `emailSettingsService - TestEmailSettings - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

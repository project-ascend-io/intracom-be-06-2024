import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { emailSettingsRepository } from '@/api/emailSettings/emailSettingsRepository';
import {
  EmailSettings,
  EmailSettingsSchema,
  EmailSettingsTestSchema,
  NewEmailSettingsSchema,
} from '@/api/emailSettings/emailSettingsSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

export const emailSettingsService = {
  // Retrieves all email settings from the database
  findById: async (id: string): Promise<ServiceResponse<EmailSettings | null>> => {
    try {
      const emailSettings = await emailSettingsRepository.findByIdAsync(id);
      if (!emailSettings) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          `No Email Settings found with Id ${id}`,
          null,
          StatusCodes.NOT_FOUND
        );
      }
      return new ServiceResponse<EmailSettings>(
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
  putEmailSettings: async (id: string, request: Request): Promise<ServiceResponse<null>> => {
    try {
      const emailSettings = EmailSettingsSchema.parse({ ...request.body });

      const updateResult = await emailSettingsRepository.updateEmailSettings(id, emailSettings);

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
      const emailTestSettings = EmailSettingsTestSchema.parse({ ...request.body });

      const testResult = await emailSettingsRepository.testEmailSettings(emailTestSettings);

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

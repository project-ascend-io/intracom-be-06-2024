import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { emailSettingsRepository } from '@/api/emailSettings/emailSettingsRepository';
import {
  EmailSettings,
  EmailSettingsTestSchema,
  NewEmailSettingsSchema,
} from '@/api/emailSettings/emailSettingsSchema';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logConfig } from '@/server';

export const emailSettingsService = {
  findById: async (id: string): Promise<ServiceResponse<EmailSettings | null>> => {
    try {
      const emailSettings = await emailSettingsRepository.findByIdAsync(id);
      if (!emailSettings) {
        return new ServiceResponse(
          ResponseStatus.Failed,
          `No Email Settings found with organization ${id}`,
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
      logConfig.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },

  changeEmailSettings: async (request: Request): Promise<ServiceResponse<EmailSettings | null>> => {
    try {
      const emailSettings = NewEmailSettingsSchema.parse({ ...request.body });
      let existingEmailSettings = await emailSettingsRepository.findByIdAsync(emailSettings.organization);
      if (!existingEmailSettings) {
        const newEmailSettings = await emailSettingsRepository.insertEmailSettings(emailSettings);
        return new ServiceResponse<EmailSettings>(
          ResponseStatus.Success,
          'Email Settings created.',
          newEmailSettings,
          StatusCodes.OK
        );
      } else {
        const updateResult = await emailSettingsRepository.updateEmailSettings(
          existingEmailSettings.organization,
          emailSettings
        );
        if (updateResult && updateResult.modifiedCount > 0) {
          existingEmailSettings = await emailSettingsRepository.findByIdAsync(emailSettings.organization);
          return new ServiceResponse<EmailSettings | null>(
            ResponseStatus.Success,
            'Email Settings updated successfully.',
            existingEmailSettings,
            StatusCodes.OK
          );
        } else {
          return new ServiceResponse<EmailSettings | null>(
            ResponseStatus.Failed,
            'No email settings were updated.',
            existingEmailSettings,
            StatusCodes.NOT_FOUND
          );
        }
      }
    } catch (error) {
      const errorMessage = `emailSettingsService - ChangeEmailSettings - Error Message`;
      logConfig.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
  testEmailSettings: async (request: Request): Promise<ServiceResponse<null>> => {
    try {
      const emailTestSettings = EmailSettingsTestSchema.parse({ ...request.body });

      const testResult = await emailSettingsRepository.testEmailSettings(emailTestSettings);

      if (testResult) {
        return new ServiceResponse<null>(
          ResponseStatus.Success,
          `Test email sent successfully to ${emailTestSettings.email}`,
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
      logConfig.error(errorMessage);
      return new ServiceResponse<null>(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

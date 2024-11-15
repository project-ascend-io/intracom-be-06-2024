import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { describe, expect, it, vi } from 'vitest';

import { EmailSettings } from '@/api/emailSettings/emailSettingsSchema';
import { emailSettingsService } from '@/api/emailSettings/emailSettingsService';
import { ServiceResponse } from '@/common/models/serviceResponse';

describe('emailSettingsRouter', () => {
  const mockEmailSettings: EmailSettings = {
    _id: '948466483938',
    server: 'localhost:8080',
    port: 5432,
    username: 'root',
    password: 'securepassword',
    verified_sender_email: 'john@example.com',
    securityType: 'TLS',
    organization: new mongoose.mongo.ObjectId('66c3d2fc189638b81eac7cee'),
  };

  const mockEmailSettingsResponse: ServiceResponse<EmailSettings> = {
    success: true,
    message: 'Email Settings found',
    responseObject: mockEmailSettings,
    statusCode: StatusCodes.OK,
  };

  const mockEmailSettingsError: ServiceResponse<EmailSettings | null> = {
    success: false,
    message: 'No Email Settings found',
    responseObject: null,
    statusCode: StatusCodes.NOT_FOUND,
  };

  describe('findById', () => {
    it('return email settings for the organization', async () => {
      // Arrange
      const findByIdMock = vi.spyOn(emailSettingsService, 'findById');
      if (!findByIdMock) {
        throw new Error('EmailSettingsService.findById is not defined');
      }
      findByIdMock.mockResolvedValue(mockEmailSettingsResponse);

      // Act
      const result = await emailSettingsService.findById('0');

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Email Settings found');
      expect(result.responseObject).toEqual(mockEmailSettings);

      // Clean up
      findByIdMock.mockRestore();
    });

    it('returns a not found error for no email settings found', async () => {
      // Arrange
      const findByIdMock = vi.spyOn(emailSettingsService, 'findById');
      if (!findByIdMock) {
        throw new Error('EmailSettingsService.findById is not defined');
      }
      findByIdMock.mockResolvedValue(mockEmailSettingsError);

      // Act
      const result = await emailSettingsService.findById('0');

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Email Settings found');
      expect(result.responseObject).toBeNull();

      // Clean up
      findByIdMock.mockRestore();
    });
  });
});

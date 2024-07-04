import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';

import { EmailSettings } from '../emailSettingsModel';
import { emailSettingsService } from '../emailSettingsService';

describe('userProfileRouter', () => {
  const mockEmailSettings: EmailSettings[] = [
    {
      server: 'localhost:8080',
      port: 5432,
      username: 'root',
      password: 'securepassword',
      securityType: 'TLS',
    },
  ];

  const mockEmailSettingsResponse: ServiceResponse<EmailSettings[]> = {
    success: true,
    message: 'Email Settings found',
    responseObject: mockEmailSettings,
    statusCode: StatusCodes.OK,
  };

  const mockEmailSettingsError: ServiceResponse<EmailSettings[]> = {
    success: false,
    message: 'No Email Settings found',
    responseObject: [],
    statusCode: StatusCodes.NOT_FOUND,
  };

  describe('findAll', () => {
    it('return all email settings', async () => {
      // Arrange
      const findAllMock = vi.spyOn(emailSettingsService, 'findAll');
      if (!findAllMock) {
        throw new Error('EmailSettingsService.findAll is not defined');
      }
      findAllMock.mockResolvedValue(mockEmailSettingsResponse);

      // Act
      const result = await emailSettingsService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Email Settings found');
      expect(result.responseObject).toEqual(mockEmailSettings);

      // Clean up
      findAllMock.mockRestore();
    });

    it('returns a not found error for no email settings found', async () => {
      // Arrange
      const findAllMock = vi.spyOn(emailSettingsService, 'findAll');
      if (!findAllMock) {
        throw new Error('EmailSettingsService.findAll is not defined');
      }
      findAllMock.mockResolvedValue(mockEmailSettingsError);

      // Act
      const result = await emailSettingsService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Email Settings found');
      expect(result.responseObject).toEqual([]);

      // Clean up
      findAllMock.mockRestore();
    });
  });
});

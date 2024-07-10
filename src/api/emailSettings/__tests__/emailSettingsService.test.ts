import { StatusCodes } from 'http-status-codes';

import { emailSettingsRepository } from '@/api/emailSettings/emailSettingsRepository';
import { EmailSettings } from '@/api/emailSettings/emailSettingsSchema';
import { emailSettingsService } from '@/api/emailSettings/emailSettingsService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

vi.mock('@/api/userProfile/userProfileRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('emailSettingsService', () => {
  const mockEmailSettings: EmailSettings = {
    _id: '847634920483974',
    server: 'localhost:8080',
    port: 5432,
    username: 'root',
    password: 'securepassword',
    securityType: 'TLS',
  };

  describe('findById', () => {
    it('return email-settings with given id', async () => {
      // Arrange
      vi.spyOn(emailSettingsRepository, 'findByIdAsync').mockReturnValue(Promise.resolve(mockEmailSettings));

      // Act
      const result = await emailSettingsService.findById('0');

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Email Settings found');
      expect(result.responseObject).toEqual(mockEmailSettings);
    });

    it('returns a not found error for no email settings found', async () => {
      // Arrange
      vi.spyOn(emailSettingsService, 'findById').mockResolvedValue(
        new ServiceResponse<{
          _id: string;
          server: string;
          port: number;
          username: string;
          password: string;
          securityType: string;
        } | null>(ResponseStatus.Failed, 'No Email Settings found', null, StatusCodes.NOT_FOUND)
      );

      // Act
      const result = await emailSettingsService.findById('0');

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Email Settings found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findById', async () => {
      // Arrange
      vi.spyOn(emailSettingsService, 'findById').mockResolvedValue(
        new ServiceResponse<{
          _id: string;
          server: string;
          port: number;
          username: string;
          password: string;
          securityType: string;
        } | null>(ResponseStatus.Failed, 'No Email Settings found', null, StatusCodes.INTERNAL_SERVER_ERROR)
      );

      // Act
      const result = await emailSettingsService.findById('231232141');

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
    });
  });
});

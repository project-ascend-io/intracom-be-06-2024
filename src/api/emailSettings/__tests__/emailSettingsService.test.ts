import { StatusCodes } from 'http-status-codes';

import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';

import { EmailSettings } from '../emailSettingsModel';
import { emailSettingsRepository } from '../emailSettingsRepository';
import { emailSettingsService } from '../emailSettingsService';

vi.mock('@/api/userProfile/userProfileRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('emailSettingsService', () => {
  const mockEmailSettings: EmailSettings[] = [
    {
      id: 1,
      server: 'localhost:8080',
      port: 5432,
      username: 'root',
      securityType: 'TLS',
    },
    {
      id: 2,
      server: 'localhost:3032',
      port: 5498,
      username: 'root',
      securityType: 'TLS',
    },
  ];

  describe('findAll', () => {
    it('return all email-settings', async () => {
      // Arrange
      vi.spyOn(emailSettingsRepository, 'findAllAsync').mockReturnValue(Promise.resolve(mockEmailSettings));

      // Act
      const result = await emailSettingsService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Email Settings found');
      expect(result.responseObject).toEqual(mockEmailSettings);
    });

    it('returns a not found error for no email settings found', async () => {
      // Arrange
      vi.spyOn(emailSettingsService, 'findAll').mockResolvedValue(
        new ServiceResponse<
          { id: number; server: string; port: number; username: string; securityType: string }[] | null
        >(ResponseStatus.Failed, 'No Email Settings found', null, StatusCodes.NOT_FOUND)
      );

      // Act
      const result = await emailSettingsService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Email Settings found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findAllAsync', async () => {
      // Arrange
      vi.spyOn(emailSettingsService, 'findAll').mockResolvedValue(
        new ServiceResponse<
          { id: number; server: string; port: number; username: string; securityType: string }[] | null
        >(ResponseStatus.Failed, 'No Email Settings found', null, StatusCodes.INTERNAL_SERVER_ERROR)
      );

      // Act
      const result = await emailSettingsService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
    });
  });

  describe('findById', () => {
    it('return a email settings', async () => {
      // Arrange
      vi.spyOn(emailSettingsRepository, 'findByIdAsync').mockReturnValue(Promise.resolve(mockEmailSettings[0]));

      // Act
      const result = await emailSettingsService.findById(1);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Email Settings found');
      expect(result.responseObject).toEqual(mockEmailSettings[0]);
    });

    it('returns a not found error for no email settings found', async () => {
      // Arrange
      vi.spyOn(emailSettingsService, 'findById').mockResolvedValue(
        new ServiceResponse<{
          id: number;
          server: string;
          port: number;
          username: string;
          securityType: string;
        } | null>(ResponseStatus.Failed, 'No Email Settings found', null, StatusCodes.NOT_FOUND)
      );

      // Act
      const result = await emailSettingsService.findById(1);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No Email Settings found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      vi.spyOn(emailSettingsRepository, 'findByIdAsync').mockRejectedValue(new Error('Database error'));

      // Act
      const result = await emailSettingsService.findById(1);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
    });
  });
});

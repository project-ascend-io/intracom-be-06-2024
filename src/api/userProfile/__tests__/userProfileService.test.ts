import { StatusCodes } from 'http-status-codes';
import { Mock } from 'vitest';

import { UserProfile } from '@/api/userProfile/userProfileModel';
import { userProfileRepository } from '@/api/userProfile/userProfileRepository';
import { userProfileService } from '@/api/userProfile/userProfileService';

vi.mock('@/api/userProfile/userProfileRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('userProfileService', () => {
  const mockUserProfiles: UserProfile[] = [
    {
      userId: 1,
      fullName: 'Alice Doe',
      statusMessage: 'Hello, World!',
    },
    {
      userId: 2,
      fullName: 'Bob Doe',
    },
  ];

  describe('findAll', () => {
    it('return all user profiles', async () => {
      // Arrange
      (userProfileRepository.findAllAsync as Mock).mockReturnValue(mockUserProfiles);

      // Act
      const result = await userProfileService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User Profiles found');
      expect(result.responseObject).toEqual(mockUserProfiles);
    });

    it('returns a not found error for no user profiles found', async () => {
      // Arrange
      (userProfileRepository.findAllAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userProfileService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No User Profiles found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findAllAsync', async () => {
      // Arrange
      (userProfileRepository.findAllAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userProfileService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
    });
  });

  describe('findById', () => {
    it('return a user profile', async () => {
      // Arrange
      (userProfileRepository.findByIdAsync as Mock).mockReturnValue(mockUserProfiles[0]);

      // Act
      const result = await userProfileService.findById(1);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User profile found');
      expect(result.responseObject).toEqual(mockUserProfiles[0]);
    });

    it('returns a not found error for no user profile found', async () => {
      // Arrange
      (userProfileRepository.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userProfileService.findById(1);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User profile not found');
      expect(result.responseObject).toBeNull();
    });

    it('handles errors for findByIdAsync', async () => {
      // Arrange
      (userProfileRepository.findByIdAsync as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userProfileService.findById(1);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
    });
  });
});

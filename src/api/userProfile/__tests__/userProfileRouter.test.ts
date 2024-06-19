import { StatusCodes } from 'http-status-codes';

import { ServiceResponse } from '@/common/models/serviceResponse';

import { UserProfile } from '../userProfileModel';
import { userProfileService } from '../userProfileService';

describe('userProfileRouter', () => {
  const mockUserProfiles: UserProfile[] = [
    {
      userId: 1,
      fullName: 'Alice Doe',
    },
  ];

  const mockUserProfilesResponse: ServiceResponse<UserProfile[]> = {
    success: true,
    message: 'User Profiles found',
    responseObject: mockUserProfiles,
    statusCode: StatusCodes.OK,
  };

  const mockUserProfilesError: ServiceResponse<UserProfile[]> = {
    success: false,
    message: 'No User Profiles found',
    responseObject: [],
    statusCode: StatusCodes.NOT_FOUND,
  };

  describe('findAll', () => {
    it('return all user profiles', async () => {
      // Arrange
      const findAllMock = vi.spyOn(userProfileService, 'findAll');
      if (!findAllMock) {
        throw new Error('UserProfileService.findAll is not defined');
      }
      findAllMock.mockResolvedValue(mockUserProfilesResponse);

      // Act
      const result = await userProfileService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User Profiles found');
      expect(result.responseObject).toEqual(mockUserProfiles);

      // Clean up
      findAllMock.mockRestore();
    });

    it('returns a not found error for no user profiles found', async () => {
      // Arrange
      const findAllMock = vi.spyOn(userProfileService, 'findAll');
      if (!findAllMock) {
        throw new Error('UserProfileService.findAll is not defined');
      }
      findAllMock.mockResolvedValue(mockUserProfilesError);

      // Act
      const result = await userProfileService.findAll();

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('No User Profiles found');
      expect(result.responseObject).toEqual([]);

      // Clean up
      findAllMock.mockRestore();
    });
  });
});

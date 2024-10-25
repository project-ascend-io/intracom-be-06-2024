import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { describe, expect, it, Mock, vi } from 'vitest';

import { organizationRepository } from '@/api/organization/organizationRepository';
import { userRoles } from '@/api/user/userModel';
import { inviteState } from '@/api/userInvite/userInviteModel';
import { userInviteRepository } from '@/api/userInvite/userInviteRepository';
import { UserInvite } from '@/api/userInvite/userInviteSchema';
import { setStateParams, userInviteService } from '@/api/userInvite/userInviteService';

vi.mock('@/api/userInvite/userInviteRepository');
vi.mock('@/api/organization/organizationRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('userInviteService', () => {
  const mockUserInvites: UserInvite[] = [
    {
      _id: new mongoose.mongo.ObjectId(),
      email: 'alice@example.com',
      state: 'Pending',
      organization: {
        _id: new mongoose.mongo.ObjectId(),
        name: 'ABC Company',
      },
      expires_in: '2024-08-09T01:16:20.091Z',
      hash: '18122d114cf9a2e60b0fa55afb62aa611e664837959d0c10b8565a22bce8e44d',
    },
    {
      _id: new mongoose.mongo.ObjectId(),
      email: 'peter@example.com',
      state: 'Accepted',
      organization: {
        _id: new mongoose.mongo.ObjectId(),
        name: 'ABC Company',
      },
      expires_in: '2024-08-09T01:16:20.091Z',
      hash: '18122d114cf9a2e60b0fa55afb62aa611e664837959d0c10b8565a22bce8e44d',
    },
  ];

  describe('getInvitesByOrgId', () => {
    it('returns all user invites by org id', async () => {
      // Arrange
      const testId = mockUserInvites[1].organization._id;
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === testId);
      (userInviteRepository.findUserInvitesByOrdId as Mock).mockReturnValue(mockUserInvites);

      // Act
      const result = await userInviteService.getInvitesByOrgId(mockOrg?._id.toString(), null);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User Invites Found');
      expect(result.responseObject).toEqual(mockUserInvites);
    });
    it('returns user invites by org id and query params', async () => {
      // Arrange
      const testId = mockUserInvites[1].organization._id;
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === testId);
      const params = { state: 'Accepted' };
      const userInvitesToReturn = [
        mockUserInvites.find((userInvite) => userInvite.organization._id === testId && userInvite.state == 'Accepted'),
      ];
      (userInviteRepository.findUserInvitesByOrdId as Mock).mockReturnValue(userInvitesToReturn);

      // Act
      const result = await userInviteService.getInvitesByOrgId(mockOrg?._id.toString(), params);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User Invites Found');
      expect(result.responseObject).toEqual(userInvitesToReturn);
      expect(result.responseObject).length(1);
    });
    it('returns user invites not found for non-existent org id', async () => {
      // Arrange
      const testId = new mongoose.mongo.ObjectId();
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === testId);
      (userInviteRepository.findUserInvitesByOrdId as Mock).mockReturnValue([]);

      // Act
      const result = await userInviteService.getInvitesByOrgId(mockOrg?._id, null);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User Invites not found');
      expect(result.responseObject).toBeNull();
    });
    it('handles errors for invalid org id', async () => {
      // Arrange
      const testId = '2455353';
      (userInviteRepository.findUserInvitesByOrdId as Mock).mockRejectedValue(new Error('Database error'));

      // Act
      const result = await userInviteService.getInvitesByOrgId(testId, null);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Error finding all user invites');
      expect(result.responseObject).toBeNull();
    });
  });

  describe('getInvitesByHash', () => {
    it('returns user invite by hash', async () => {
      // Arrange
      const testHash = mockUserInvites[1].hash;
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite.hash === testHash);

      if (mockUserInvite) {
        //setting expiration date to a future date
        mockUserInvite.expires_in = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
      }

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(mockUserInvite);
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvite?.organization);

      // Act
      const result = await userInviteService.getByhash(testHash);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User invite found.');
      expect(result.responseObject).toEqual(mockUserInvite);

      //return the expiration date back
      mockUserInvite.expires_in = '2024-08-09T01:16:20.091Z';
    });
    it('returns user invite not found', async () => {
      // Arrange
      const testHash = '12345';

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(null);
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userInviteService.getByhash(testHash);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite not found');
      expect(result.responseObject).toEqual(null);
    });
    it('returns user invite expired', async () => {
      // Arrange
      const testHash = mockUserInvites[1].hash;
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite.hash === testHash);

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(mockUserInvite);
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(null);

      // Act
      const result = await userInviteService.getByhash(testHash);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.GONE);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User invitation has expired');
      expect(result.responseObject).toEqual(null);
    });
  });

  describe('insertInvites', () => {
    it('creates and returns user invites', async () => {
      // Arrange
      const userEmails = [mockUserInvites[0].email, mockUserInvites[1].email];

      const orgId = mockUserInvites[0].organization._id;
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvites[0].organization);

      (userInviteRepository.insert as Mock).mockReturnValue(mockUserInvites);

      // Act
      const result = await userInviteService.insertInvites(orgId.toString(), userEmails);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.CREATED);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User invites created.');
      expect(result.responseObject).toContain(mockUserInvites);
    });
    it('returns error if user invite already exists', async () => {
      // Arrange
      const userEmails = [mockUserInvites[0].email];

      const orgId = mockUserInvites[0].organization._id;
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvites[0].organization);
      (userInviteRepository.findByEmailAsync as Mock).mockReturnValue(userEmails[0]);
      (userInviteRepository.insert as Mock).mockReturnValue(null);

      // Act
      const result = await userInviteService.insertInvites(orgId.toString(), userEmails);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite already exists');
      expect(result.responseObject).toEqual(null);
    });
    it('returns error if the organization is not found', async () => {
      // Arrange
      const userEmails = [mockUserInvites[0].email];

      const orgId = mockUserInvites[0].organization._id;
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(null);
      (userInviteRepository.findByEmailAsync as Mock).mockReturnValue(null);
      (userInviteRepository.insert as Mock).mockReturnValue(null);

      // Act
      const result = await userInviteService.insertInvites(orgId.toString(), userEmails);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Organization not found');
      expect(result.responseObject).toEqual(null);
    });
  });

  describe('updateById', () => {
    //testing setStateParams() which is responsible for setting the state params that will be passed to repository
    //this method is also used for updateByhash() service method

    it('updates invite status to Expired as User', async () => {
      // const setStateParams = (userInviteParams: any, userInvite: UserInvite, role: userRoles) => {
      //   if (
      //     (userInviteParams.state == inviteState.Accepted || userInviteParams.state == inviteState.Pending) &&
      //     !isValid(userInvite.expires_in) &&
      //     role == userRoles.User
      //   ) {
      //     userInviteParams.state = inviteState.Expired;
      //   } else if (userInviteParams.state == inviteState.Denied) {
      //     userInviteParams.hash = '';
      //     userInviteParams.expires_in = '';
      //   } else if (userInviteParams.state == inviteState.Accepted) {
      //     userInviteParams.hash = '';
      //   } else if (userInviteParams.state == inviteState.Pending) {
      //     const newStr = randomBytes(10).toString('hex');
      //     userInviteParams.hash = generateHash(userInviteParams.email + newStr);
      //     userInviteParams.expires_in = generateExpDate();
      //   }
      //   return userInviteParams;
      // };

      const userInvite = mockUserInvites[0]; //user invite with expired date and pending state
      const params = { state: inviteState.Accepted };
      const updatedParams = setStateParams(params, userInvite, userRoles.User);

      expect(updatedParams).toHaveProperty('state');
      expect(updatedParams.state).toBe('Expired');
    });

    it('updates user invite state to Denied as Admin/User', async () => {
      const userInvite = mockUserInvites[0];
      const params = { state: inviteState.Denied };
      const updatedParams = setStateParams(params, userInvite, userRoles.User);

      expect(updatedParams).toHaveProperty('state');
      expect(updatedParams).toHaveProperty('expires_in');
      expect(updatedParams).toHaveProperty('hash');
      expect(updatedParams.state).toBe('Denied');
    });

    it('updates user invite state to Accepted as Admin', async () => {
      const userInvite = mockUserInvites[0];
      const params = { state: inviteState.Accepted };
      const updatedParams = setStateParams(params, userInvite, userRoles.Admin);

      expect(updatedParams).toHaveProperty('state');
      expect(updatedParams.state).toBe('Accepted');
      expect(updatedParams).toHaveProperty('hash');
      expect(updatedParams.hash).toBe('');
    });

    it('updates user invite state to Pending as Admin', async () => {
      const userInvite = mockUserInvites[1];
      const params = { state: inviteState.Pending };
      const updatedParams = setStateParams(params, userInvite, userRoles.Admin);

      expect(updatedParams).toHaveProperty('state');
      expect(updatedParams).toHaveProperty('hash');
      expect(updatedParams.hash).toBeTypeOf('string');
      expect(updatedParams.hash).not.toBe('');
      expect(updatedParams.state).toBe('Pending');
      expect(updatedParams).toHaveProperty('expires_in');
      expect(updatedParams.expires_in).toBeTypeOf('string');
      expect(updatedParams.expires_in).not.toBe('');
    });

    it('returns error if organization not found', async () => {
      const orgId = new mongoose.mongo.ObjectId();
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === orgId);

      const id = mockUserInvites[0]._id;

      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockOrg);

      const params = {
        state: inviteState.Accepted,
      };

      // Act
      const result = await userInviteService.updateById(id, orgId, params);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Organization not found');
      expect(result.responseObject).toBe(null);
    });

    it('returns error if user invite with an email already exists', async () => {
      const userInviteToUpdate = mockUserInvites[0];
      const mockOrg = userInviteToUpdate.organization;
      const existingEmail = mockUserInvites[1].email;

      const params = {
        email: existingEmail,
      };

      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockOrg);
      (userInviteRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvites[0]);
      (userInviteRepository.findByEmailAsync as Mock).mockReturnValue(mockUserInvites[1]);

      const result = await userInviteService.updateById(
        userInviteToUpdate._id.toString(),
        mockOrg._id.toString(),
        params
      );

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite with this email already exists');
      expect(result.responseObject).toBe(null);
    });
    it('returns error if user invite not found', async () => {
      const orgId = mockUserInvites[0].organization._id;
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === orgId);

      const id = new mongoose.mongo.ObjectId();
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite._id === id);

      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockOrg);
      (userInviteRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvite);

      const params = {
        state: inviteState.Accepted,
      };

      // Act
      const result = await userInviteService.updateById(id, orgId, params);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite not found');
      expect(result.responseObject).toBe(null);
    });
    it('returns error if user invite is already accepted', async () => {
      const orgId = mockUserInvites[1].organization._id;

      const id = mockUserInvites[1]._id;
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite._id === id);
      mockUserInvite.state = inviteState.Accepted;

      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvites[1].organization);
      (userInviteRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvite);

      const params = {
        state: inviteState.Accepted,
      };

      // Act
      const result = await userInviteService.updateById(id, orgId, params);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite is already accepted');
      expect(result.responseObject).toBe(null);
    });
  });

  describe('updateByHash', () => {
    it('updates invite status', async () => {
      const hash = mockUserInvites[0].hash;
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite.hash === hash);

      if (mockUserInvite) {
        //setting expiration date to a future date
        mockUserInvite.expires_in = new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
        mockUserInvite.state = inviteState.Accepted;
      }

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(mockUserInvite);
      (userInviteRepository.update as Mock).mockReturnValue(mockUserInvite);

      const params = {
        state: inviteState.Accepted,
      };

      // Act
      const result = await userInviteService.updateByHash(hash, params);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.OK);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('User invite updated.');
      expect(result.responseObject).toHaveProperty('state');
      expect(result.responseObject.state).toBe('Accepted');

      //setting expiration date baak to normal
      mockUserInvite.expires_in = '2024-08-09T01:16:20.091Z';
    });
    it('returns error if user invite not found', async () => {
      const hash = '123';
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite.hash === hash);

      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(mockUserInvite);

      const params = {
        state: inviteState.Accepted,
      };

      // Act
      const result = await userInviteService.updateByHash(hash, params);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite not found');
      expect(result.responseObject).toBe(null);
    });
    it('returns error if user invite expired', async () => {
      const hash = mockUserInvites[0].hash;
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite.hash === hash);
      (userInviteRepository.findByHashAsync as Mock).mockReturnValue(mockUserInvite);

      const params = {
        state: inviteState.Accepted,
      };

      // Act
      const result = await userInviteService.updateByHash(hash, params);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite expired');
      expect(result.responseObject).toBe(null);
    });
  });

  describe('deleteById', () => {
    it('deletes user invite by id', async () => {
      const orgId = mockUserInvites[0].organization._id;
      const id = mockUserInvites[0]._id;
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite._id === id);

      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvites[0].organization);
      (userInviteRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvite);
      (userInviteRepository.deleteById as Mock).mockReturnValue(null);

      // Act
      const result = await userInviteService.deleteById(id, orgId);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.NO_CONTENT);
      expect(result.success).toBeTruthy();
      expect(result.responseObject).toBe(null);
    });
    it('returns error if user invite not found', async () => {
      const orgId = mockUserInvites[0].organization._id;
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === orgId);

      const id = new mongoose.mongo.ObjectId();
      const mockUserInvite = mockUserInvites.find((userInvite) => userInvite._id === id);

      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockOrg);
      (userInviteRepository.findByIdAsync as Mock).mockReturnValue(mockUserInvite);

      // Act
      const result = await userInviteService.deleteById(id, orgId);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('User Invite not found');
      expect(result.responseObject).toBe(null);
    });
    it('returns error if organization not found', async () => {
      const orgId = new mongoose.mongo.ObjectId();
      const mockOrg = mockUserInvites.find((userInvite) => userInvite.organization._id === orgId);

      const id = mockUserInvites[0]._id;
      (organizationRepository.findByIdAsync as Mock).mockReturnValue(mockOrg);

      // Act
      const result = await userInviteService.deleteById(id, orgId);

      // // Assert
      expect(result.statusCode).toEqual(StatusCodes.NOT_FOUND);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('Organization not found');
      expect(result.responseObject).toBe(null);
    });
  });
});

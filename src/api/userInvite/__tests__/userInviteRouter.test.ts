import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, Mock, TestContext, vi } from 'vitest';

import { UserInvite } from '@/api/userInvite/userInviteSchema';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { ResponseStatus } from '@/common/models/serviceResponse';
import { app } from '@/server';

import { userInviteService } from '../userInviteService';

vi.mock('../userInviteService', () => ({
  userInviteService: {
    getInvitesByOrgId: vi.fn(),
    getByhash: vi.fn(),
    insertInvites: vi.fn(),
  },
}));

interface UserInviteTaskContext {
  userInviteList: UserInvite[];
}

type UserInviteTestContext = TestContext & UserInviteTaskContext;

describe('User Invite API Endpoints', () => {
  beforeEach(async (context: UserInviteTestContext) => {
    const userInviteList: UserInvite[] = [];
    for (let i: number = 0; i < 10; i++) {
      const objectId = new mongoose.mongo.ObjectId();
      userInviteList.push({
        _id: objectId,
        email: i + '@gmail.com',
        state: 'Pending',
        organization: {
          _id: new mongoose.mongo.ObjectId(),
          name: 'Test name',
        },
        expires_in: '2024-08-09T01:16:20.091Z',
        hash: `prefix+${i}`,
      });
    }
    context.userInviteList = userInviteList;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /organizations/:orgId/user-invites', () => {
    it('should return a list of user invites by organization id', async ({ userInviteList }: UserInviteTestContext) => {
      // Arrange
      const testId = userInviteList[1].organization._id;
      const userInvitesArray = userInviteList.filter((invite) => invite.organization._id.equals(testId));

      const responseMock = new ServiceResponse<UserInvite[]>(
        ResponseStatus.Success,
        'User invites found',
        userInvitesArray,
        StatusCodes.OK
      );
      (userInviteService.getInvitesByOrgId as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).get(`/organizations/${testId}/user-invites`);
      const responseBody: ServiceResponse<UserInvite> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('User invites found');
    });

    it('should return user invites not found', async ({ userInviteList }: UserInviteTestContext) => {
      // Arrange
      const testId = userInviteList[1].organization._id;
      const userInvitesArray: any = [];

      const responseMock = new ServiceResponse<UserInvite[]>(
        ResponseStatus.Success,
        'User invites not found',
        userInvitesArray,
        StatusCodes.OK
      );
      (userInviteService.getInvitesByOrgId as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).get(`/organizations/${testId}/user-invites`);
      const responseBody: ServiceResponse<UserInvite> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.OK);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('User invites not found');
    });

    it('should return error if query params are invalid', async ({ userInviteList }: UserInviteTestContext) => {
      // Arrange
      const testId = userInviteList[1].organization._id;
      const params = { state: 'Deleted' };

      const responseMock = new ServiceResponse<UserInvite[] | null>(
        ResponseStatus.Failed,
        'User invites not found',
        null,
        StatusCodes.BAD_REQUEST
      );
      (userInviteService.getInvitesByOrgId as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).get(`/organizations/${testId}/user-invites`).query(params);

      const responseBody: ServiceResponse<UserInvite> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain(
        'Invalid input: Query Invite state should be one of the following: Pending, Accepted, Denied, Expired.'
      );
    });
  }),
    describe('GET /user-invites/:hash', () => {
      it('should return user invite by hash', async ({ userInviteList }: UserInviteTestContext) => {
        const testHash = userInviteList['1'].hash;
        const userInvite = userInviteList.find((userInvite: UserInvite) => userInvite.hash === testHash) as UserInvite;
        const expectedUserInvite: UserInvite = {
          _id: userInvite._id,
          email: userInvite.email,
          hash: userInvite.hash,
          organization: {
            _id: new mongoose.mongo.ObjectId(),
            name: 'ABC Company',
          },
          expires_in: userInvite.expires_in,
          state: userInvite.state,
        };

        const responseMock = new ServiceResponse<UserInvite>(
          ResponseStatus.Success,
          'User invite found',
          expectedUserInvite,
          StatusCodes.OK
        );
        (userInviteService.getByhash as Mock).mockReturnValue(responseMock);

        // Act
        const response = await request(app).get(`/user-invites/${testHash}`);
        const responseBody: ServiceResponse<UserInvite> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.OK);
        expect(responseBody.success).toBeTruthy();
        expect(responseBody.message).toContain('User invite found');
      });
    });

  it('should return user invite not found', async () => {
    const testHash = '1234';

    const responseMock = new ServiceResponse<UserInvite | null>(
      ResponseStatus.Failed,
      'User Invite not found',
      null,
      StatusCodes.NOT_FOUND
    );
    (userInviteService.getByhash as Mock).mockReturnValue(responseMock);

    // Act
    const response = await request(app).get(`/user-invites/${testHash}`);
    const responseBody: ServiceResponse<UserInvite> = response.body;

    // Assert
    expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
    expect(responseBody.success).toBeFalsy();
    expect(responseBody.message).toContain('User Invite not found');
  });

  it('should return user invite expired', async ({ userInviteList }: UserInviteTestContext) => {
    const testHash = userInviteList['1'].hash;

    const responseMock = new ServiceResponse<UserInvite | null>(
      ResponseStatus.Failed,
      'User Invite expired',
      null,
      StatusCodes.GONE
    );
    (userInviteService.getByhash as Mock).mockReturnValue(responseMock);

    // Act
    const response = await request(app).get(`/user-invites/${testHash}`);
    const responseBody: ServiceResponse<UserInvite> = response.body;

    // Assert
    expect(response.statusCode).toEqual(StatusCodes.GONE);
    expect(responseBody.success).toBeFalsy();
    expect(responseBody.message).toContain('User Invite expired');
  });

  describe('POST /organizations/:orgId/user-invites', () => {
    it('should create user invites for specific organization', async ({ userInviteList }: UserInviteTestContext) => {
      // Arrange
      const userEmails = {
        emails: [userInviteList[0].email, userInviteList[1].email],
      };

      const orgId = userInviteList[0].organization._id;
      const responseMock = new ServiceResponse<UserInvite[]>(
        ResponseStatus.Success,
        'User invites created.',
        userInviteList.slice(0, 2),
        StatusCodes.CREATED
      );
      (userInviteService.insertInvites as Mock).mockReturnValue(responseMock);

      // Act
      const response = await request(app).post(`/organizations/${orgId}/user-invites`).send(userEmails);
      const responseBody: ServiceResponse<UserInvite[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('User invites created');
    }),
      it('should return error if the email already exists', async ({ userInviteList }: UserInviteTestContext) => {
        // Arrange
        const userEmails = {
          emails: [userInviteList[0].email, userInviteList[1].email],
        };

        const orgId = userInviteList[0].organization._id;
        const responseMock = new ServiceResponse<UserInvite[] | null>(
          ResponseStatus.Failed,
          'User Invite already exists',
          null,
          StatusCodes.UNPROCESSABLE_ENTITY
        );
        (userInviteService.insertInvites as Mock).mockReturnValue(responseMock);

        // Act
        const response = await request(app).post(`/organizations/${orgId}/user-invites`).send(userEmails);
        const responseBody: ServiceResponse<UserInvite[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.UNPROCESSABLE_ENTITY);
        expect(responseBody.success).toBeFalsy();
        expect(responseBody.message).toContain('User Invite already exists');
      }),
      it('should return error if the emails array is empty', async ({ userInviteList }: UserInviteTestContext) => {
        // Arrange
        const userEmails = {
          emails: [],
        };

        const orgId = userInviteList[0].organization._id;
        const responseMock = new ServiceResponse<UserInvite[] | null>(
          ResponseStatus.Failed,
          'Invalid input: Emails Emails array cannot be empty.',
          null,
          StatusCodes.BAD_REQUEST
        );
        (userInviteService.insertInvites as Mock).mockReturnValue(responseMock);

        // Act
        const response = await request(app).post(`/organizations/${orgId}/user-invites`).send(userEmails);
        const responseBody: ServiceResponse<UserInvite[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(responseBody.success).toBeFalsy();
        expect(responseBody.message).toContain('Emails array cannot be empty');
      }),
      it('should return error if the organization is not found', async ({ userInviteList }: UserInviteTestContext) => {
        // Arrange
        const userEmails = {
          emails: [userInviteList[0].email, userInviteList[1].email],
        };

        const orgId = userInviteList[0].organization._id;
        const responseMock = new ServiceResponse<UserInvite[] | null>(
          ResponseStatus.Failed,
          'Organization not found.',
          null,
          StatusCodes.NOT_FOUND
        );
        (userInviteService.insertInvites as Mock).mockReturnValue(responseMock);

        // Act
        const response = await request(app).post(`/organizations/${orgId}/user-invites`).send(userEmails);
        const responseBody: ServiceResponse<UserInvite[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.NOT_FOUND);
        expect(responseBody.success).toBeFalsy();
        expect(responseBody.message).toContain('Organization not found.');
      }),
      it('should return error if emails is missing in body request', async ({
        userInviteList,
      }: UserInviteTestContext) => {
        const orgId = userInviteList[0].organization._id;
        const responseMock = new ServiceResponse<UserInvite[] | null>(
          ResponseStatus.Failed,
          'Invalid input: Emails Required.',
          null,
          StatusCodes.BAD_REQUEST
        );
        (userInviteService.insertInvites as Mock).mockReturnValue(responseMock);

        // Act
        const response = await request(app).post(`/organizations/${orgId}/user-invites`);
        const responseBody: ServiceResponse<UserInvite[]> = response.body;

        // Assert
        expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
        expect(responseBody.success).toBeFalsy();
        expect(responseBody.message).toContain('Invalid input: Emails Required.');
      });
  });
});

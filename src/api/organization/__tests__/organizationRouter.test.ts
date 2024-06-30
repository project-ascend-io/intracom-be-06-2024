import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import request from 'supertest';
import { describe, expect, it, Mock, vi } from 'vitest';

import { BasicOrganization, Organization } from '@/api/organization/organizationSchema';
import { organizationService } from '@/api/organization/organizationService';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

vi.mock('../organizationService', () => ({
  organizationService: {
    insert: vi.fn(),
  },
}));

describe('Organization API Endpoints', () => {
  describe('POST /organizations', () => {
    it('should create a new organization and return the newly created organization', async () => {
      const newOrg: BasicOrganization = {
        name: 'Ocean Beach Front',
      };
      const savedOrg: Organization = {
        _id: new mongoose.mongo.ObjectId(),
        ...newOrg,
      };
      const responseMock = new ServiceResponse<Organization>(
        ResponseStatus.Success,
        'Organization created.',
        savedOrg,
        StatusCodes.OK
      );
      (organizationService.insert as Mock).mockReturnValue(responseMock);
      const response = await request(app).post(`/organizations`).send(newOrg).set('Accept', 'application/json');
      expect(response.statusCode).toEqual(StatusCodes.OK);
    });
  });
});

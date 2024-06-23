import { StatusCodes } from 'http-status-codes';
import request from 'supertest';
import { describe, expect, it } from 'vitest';

// import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { NewOrganization } from '@/api/organization/organizationSchema';
import { app } from '@/server';

describe('Organization API Endpoints', () => {
  describe('POST /organizations', () => {
    it('should create a new organization and return the newly created organization', async () => {
      const newOrg: NewOrganization = {
        name: 'Ocean Beach Front',
      };

      const response = await request(app).post(`/organizations`).send(newOrg).set('Accept', 'application/json');
      expect(response.statusCode).toEqual(StatusCodes.OK);
    });
  });
});

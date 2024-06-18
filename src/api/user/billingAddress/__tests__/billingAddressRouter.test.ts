import { StatusCodes } from 'http-status-codes';
import request from 'supertest';

import { BillingAddress } from '@/api/user/billingAddress/billingAddressModel';
import { ServiceResponse } from '@/common/models/serviceResponse';
import { app } from '@/server';

describe('Billing Address Endpoints', () => {
  describe('POST /users/billing-address', () => {
    it('should return a new Billing Address created', async () => {
      // Act
      const validBody = {
        streetAddress: '566 SE',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98071',
        country: 'USA',
      };

      const response = await request(app).post('/users/billing-address').send(validBody);
      const responseBody: ServiceResponse<BillingAddress[]> = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.CREATED);
      expect(responseBody.success).toBeTruthy();
      expect(responseBody.message).toContain('Billing Address created');
    });

    it('should return a bad request for invalid body', async () => {
      // Act
      // email is a non-existent field in the body
      const invalidBody = { email: 'ratts@gmail.com' };
      const response = await request(app).post('/users/billing-address').send(invalidBody);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('is required');
      expect(responseBody.responseObject).toBeNull();
    });
    it('should return a bad request and the msg about the field missing', async () => {
      //   invalid body with a missing Street Address field
      const invalidBody = {
        city: 'Seattle',
        state: 'WA',
        postalCode: '98071',
        country: 'USA',
      };
      const response = await request(app).post('/users/billing-address').send(invalidBody);
      const responseBody: ServiceResponse = response.body;

      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Street Address is required');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for the empty field', async () => {
      // Invalid body with an empty country field
      const invalidBody = {
        streetAddress: '566 SE',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98071',
        country: '',
      };
      const response = await request(app).post('/users/billing-address').send(invalidBody);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Country cannot be empty');
      expect(responseBody.responseObject).toBeNull();
    });

    it('should return a bad request for the wrong postal code format', async () => {
      // Invalid body with a postal code less than 5 characters
      const invalidBody = {
        streetAddress: '566 SE',
        city: 'Seattle',
        state: 'WA',
        postalCode: '9807',
        country: '',
      };
      const response = await request(app).post('/users/billing-address').send(invalidBody);
      const responseBody: ServiceResponse = response.body;

      // Assert
      expect(response.statusCode).toEqual(StatusCodes.BAD_REQUEST);
      expect(responseBody.success).toBeFalsy();
      expect(responseBody.message).toContain('Invalid postal code format. Postal Code should be at least 5 characters');
      expect(responseBody.responseObject).toBeNull();
    });
  });
});

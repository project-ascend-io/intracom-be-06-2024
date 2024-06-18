import { StatusCodes } from 'http-status-codes';
import { Mock } from 'vitest';

import { BillingAddress } from '@/api/user/billingAddress/billingAddressModel';
import { billingAddressRepository } from '@/api/user/billingAddress/billingAddressRepository';
import { billingAddressService } from '@/api/user/billingAddress/billingAddressService';

vi.mock('@/api/user/billingAddress/billingAddressRepository');
vi.mock('@/server', () => ({
  ...vi.importActual('@/server'),
  logger: {
    error: vi.fn(),
  },
}));

describe('billingAddressService', () => {
  const mockBillingAddress: BillingAddress = {
    streetAddress: '3333',
    city: 'Seattle',
    state: 'WA',
    postalCode: '98015',
    country: 'USA',
  };

  describe('insertBillingAddress', () => {
    it('inserts new billing address', async () => {
      // Arrange
      (billingAddressRepository.insertBillingAddress as Mock).mockReturnValue(mockBillingAddress);

      // Act
      const billingAddress: BillingAddress = {
        streetAddress: '3333',
        city: 'Seattle',
        state: 'WA',
        postalCode: '98015',
        country: 'USA',
      };

      const result = await billingAddressService.insertBillingAddress(billingAddress);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.CREATED);
      expect(result.success).toBeTruthy();
      expect(result.message).toContain('Billing Address created');
      expect(result.responseObject).toEqual(mockBillingAddress);
    });

    it('error inserting billing address', async () => {
      // Arrange
      (billingAddressRepository.insertBillingAddress as Mock).mockReturnValue(null);

      // Act
      //billing address with a missing street address field
      const billingAddress: any = {
        city: 'Seattle',
        state: 'WA',
        postalCode: '98015',
        country: 'USA',
      };

      const result = await billingAddressService.insertBillingAddress(billingAddress);

      // Assert
      expect(result.statusCode).toEqual(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(result.success).toBeFalsy();
      expect(result.message).toContain('billingAddressService - InsertBillingAddress - Error Message');
      expect(result.responseObject).toEqual(null);
    });
  });
});

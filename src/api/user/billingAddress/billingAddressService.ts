import { Request } from 'express';
import { StatusCodes } from 'http-status-codes';

import { NewBillingAddressSchema } from '@/api/user/billingAddress/billingAddressModel';
import { billingAddressRepository } from '@/api/user/billingAddress/billingAddressRepository';
import { ResponseStatus, ServiceResponse } from '@/common/models/serviceResponse';
import { logger } from '@/server';

import { BillingAddress } from './billingAddressModel';

export const BillingAddressService = {
  insertBillingAddress: async (request: Request): Promise<ServiceResponse<BillingAddress | null>> => {
    try {
      console.log('Body: ', request.body);
      console.log('Params: ', request.params);
      const billingAddress = NewBillingAddressSchema.parse({ ...request.body });
      console.log('New Billing Address Schema', billingAddress);

      const newBillingAddress = await billingAddressRepository.insertBillingAddress(billingAddress);

      return new ServiceResponse<BillingAddress>(
        ResponseStatus.Success,
        'Billing Address created.',
        newBillingAddress,
        StatusCodes.CREATED
      );
    } catch (err) {
      const errorMessage = `billingAddressService - InsertBillingAddress - Error Message`;
      logger.error(errorMessage);
      return new ServiceResponse(ResponseStatus.Failed, errorMessage, null, StatusCodes.INTERNAL_SERVER_ERROR);
    }
  },
};

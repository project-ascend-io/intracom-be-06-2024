import { BillingAddress, BillingAddressModel } from '@/api/user/billingAddress/billingAddressModel';

import { mongoDatabase } from '../../mongoDatabase';

export const billingAddressRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  insertBillingAddress: async (billingAddress: BillingAddress): Promise<BillingAddress> => {
    try {
      await billingAddressRepository.startConnection();
      const newBillingAddress = new BillingAddressModel(billingAddress);
      const savedBillingAddress = await newBillingAddress.save();
      return savedBillingAddress;
    } catch (err) {
      console.error('Error inserting billing address: ', err);
      throw err;
    }
  },
};

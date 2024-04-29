import mongoose, { Mongoose } from 'mongoose';

import { env } from '@/common/utils/envConfig';

export enum MongoDbCollection {
  USERS = 'users',
}

export const mongoDatabase = {
  initConnection: async (): Promise<Mongoose> => {
    const { MONGODB_CONNECTION_STRING } = env;
    console.log('Mongo DB Connection String: ', MONGODB_CONNECTION_STRING);
    return await mongoose.connect(MONGODB_CONNECTION_STRING);
  },
};

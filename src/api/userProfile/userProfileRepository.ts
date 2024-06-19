import { DeleteResult, UpdateResult } from 'mongodb';

import { UserProfile, UserProfileModel } from '@/api/userProfile/userProfileModel';

import { mongoDatabase } from '../mongoDatabase';

export const userProfileRepository = {
  startConnection: async () => {
    const mongoDb = await mongoDatabase.initConnection();
    return mongoDb;
  },

  findAllAsync: async (): Promise<UserProfile[]> => {
    const mongodb = await userProfileRepository.startConnection();
    const UserProfileCollection = mongodb.model<UserProfile>('UserProfile');
    return await UserProfileCollection.find();
  },

  findByIdAsync: async (id: number): Promise<UserProfile | null> => {
    const mongodb = await userProfileRepository.startConnection();
    const UserProfileCollection = mongodb.model<UserProfile>('UserProfile');
    return await UserProfileCollection.findOne({ userId: id });
  },

  insertUserProfile: async (userProfile: UserProfile): Promise<UserProfile> => {
    try {
      const mongodb = await userProfileRepository.startConnection();
      const UserProfileCollection = mongodb.model<UserProfile>('UserProfile');
      const newUserProfile = new UserProfileModel(userProfile);
      console.log(newUserProfile);
      const savedUserProfile = await UserProfileCollection.create(newUserProfile);
      return savedUserProfile;
    } catch (err) {
      console.error('Error inserting user: ', err);
      throw err;
    }
  },

  deleteByUserIdAsync: async (id: number): Promise<DeleteResult | null> => {
    const mongodb = await userProfileRepository.startConnection();
    const UserProfileCollection = mongodb.model<UserProfile>('UserProfile');
    return await UserProfileCollection.deleteOne({ userId: id });
  },

  patchUserProfile: async (userProfile: UserProfile): Promise<UpdateResult<Document> | null> => {
    try {
      const mongodb = await userProfileRepository.startConnection();
      const UserProfileCollection = mongodb.model<UserProfile>('UserProfile');

      const updateData = { $set: userProfile };
      const savedUserProfile = await UserProfileCollection.updateOne({ userId: userProfile.userId }, updateData);
      if (savedUserProfile.matchedCount === 0) {
        console.log('No user profile found with the given fullName to update.');
        return null;
      }
      return savedUserProfile;
    } catch (err) {
      console.error('Error updating user profile: ', err);
      throw err;
    }
  },
};
